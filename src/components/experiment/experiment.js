/** @flow */
import React from "react";
import Immutable from 'immutable';
import VariationComponent from '../../components/variation';
import VariationContainer from '../../containers/variation';
import selectVariation from '../../utils/select-variation';
import { cacheStore } from '../../utils/create-cache-store';
import getKey from '../../utils/get-key';

type Props = {
  /**
   * Redux State:
   * ```js
   *   reduxAbTest = {
   *     experiments: [],
   *     active: {
   *       "experiment.name" => "variation.name",
   *       ...
   *     }
   *     ...
   *   }
   * ```
   */
  reduxAbTest: Immutable.Map,
  /**
   * Selector key for choosing an experiment from the redux store.
   * This can be used as such:
   *  <Experiment selector=`Homepage Header Experiment`> ... </Experiment>
   */
  selector: ?string,
  /**
   * ID of the experiment, this is used to pick a specific experient from the redux store.
   * We use getKey to generate the `key` for this experiment.
   */
  id: ?string,
  /**
   * Name of the experiment, this is used to pick a specific experient from the redux store.
   * This should only be used as a fallback if `id` is unavailable
   */
  name: string,
  /**
   * Name of the default variation.
   * >  When defined, this value is used to choose a variation if a stored value is not present.
   * >  This property may be useful for server side rendering but is otherwise not recommended.
   */
  defaultVariationName: ?string,
  /**
   * Action Creator callback: Function({experiment:ExperimentType})
   */
  dispatchActivate: Function,
  /**
   * Action Creator callback: Function({experiment:ExperimentType})
   */
  dispatchDeactivate: Function,
  /**
   * Action Creator callback: Function({experiment:ExperimentType, variation:VariationType})
   */
  dispatchPlay: Function,
  /**
   * Action Creator callback: Function({experiment:ExperimentType, variation:VariationType})
   */
  dispatchWin: Function,
  /**
   * Optional: Add the prop `dispatchWin({ actionType, actionPayload })` to the rendered component.
   * The experiment & variation are automatically bound for you.
   */
  bindDispatchWin: ?bool,
  /**
   * Variation Children to render
   */
  children: any,
};


type State = {
  /**
   * The currenly active experiment
   */
  experiment: ?ExperimentType,
  /**
   * The currenly active variation
   */
  variation: ?VariationType,
  /**
   * The experient was played
   */
  played: ?bool,
};


export default class Experiment extends React.Component {
  props: Props;
  state: State;
  static defaultProps = {
    reduxAbTest:          Immutable.Map({}),
    id:                   null,
    name:                 null,
    selector:             null,
    defaultVariationName: null,
    dispatchActivate:     () => {},
    dispatchDeactivate:   () => {},
    dispatchPlay:         () => {},
    dispatchWin:          () => {},
    bindDispatchWin:      false,
  };
  state = {
    variation:  null,
    experiment: null,
    played:     false,
  };


  /**
   * Activate the variation
   */
  componentWillMount() {
    const { id, name, selector, defaultVariationName, reduxAbTest, dispatchActivate, dispatchPlay } = this.props;
    const experiment = this.getExperiment(reduxAbTest, selector, id, name);

    // If the experiment is unavailable, then record it wasn't played and move on
    if (!experiment) {
      this.setState({ experiment: null, variation: null, played: false });
      return;
    }

    const variation = selectVariation({
      active: reduxAbTest.get('active'),
      experiment,
      defaultVariationName,
      cacheStore
    });

    // These will trigger `componentWillReceiveProps`
    dispatchActivate({experiment});
    dispatchPlay({experiment, variation});
    this.setState({ experiment, variation, played: true });
  }


  /**
   * Update the component's state with the new properties
   */
  componentWillReceiveProps(nextProps:Props) {
    const { selector, id, name, defaultVariationName, reduxAbTest, dispatchActivate, dispatchPlay } = nextProps;
    const experiment = this.getExperiment(reduxAbTest, selector, id, name);
    if (!experiment) {
      // If we no-longer have an experiment anymore, then update the internal state
      if (this.state.experiment) {
        this.setState({ experiment: null, variation: null, played: false });
      }
      return;
    }

    const variation = selectVariation({
      active: reduxAbTest.get('active'),
      experiment,
      defaultVariationName,
      cacheStore
    });

    if (!experiment.equals(this.state.experiment) || !variation.equals(this.state.variation)) {
      // These will trigger `componentWillReceiveProps`
      if (!this.state.played) {
        dispatchActivate({experiment});
        dispatchPlay({experiment, variation});
      }
      this.setState({ experiment, variation, played: true });
    }
  }

  getExperiment(reduxAbTest, selector, id, name) {
    // Find the key of the currently available experiment
    const key = reduxAbTest.getIn(['availableExperiments', selector || id || name], null);
    if (!key) {
      return null;
    }
    // Select the experiment from the redux store
    const experiment = reduxAbTest.get('experiments').find(experiment => (getKey(experiment) === key), null);
    // Return the resulting experiment
    return experiment;
  }

  isNotVariationChildren() {
    const { children } = this.props;
    return (React.Children.count(children) === 1 && (!React.isValidElement(children) || React.Children.only(children).type !== VariationComponent || React.Children.only(children).type !== VariationContainer));
  }


  /**
   * Deactivate the variation from the state
   */
  componentWillUnmount() {
    const { dispatchDeactivate } = this.props;
    const { experiment } = this.state;
    // Dispatch the deactivation event
    if (experiment) {
      dispatchDeactivate({experiment});
    }
  }


  /**
   * Render one of the variations or `null`
   */
  render() {
    const { children, dispatchWin, bindDispatchWin } = this.props;
    const { experiment, variation } = this.state;

    const notVariationChildren = this.isNotVariationChildren();
    if (!variation) {
      return notVariationChildren ? children : null;
    }

    // If you specified something other than a `Variation` as the children,
    // then we should wrap the children in a Variation component automatically for you.
    //
    // This is handy for experiments where you have programmable variations but don't want to hard-code each of them.
    // Ex:
    //   Component on your page:
    //     <Experiment name="...">
    //       <h1>My fancy text here ...</h1>
    //     </Experiment>
    //
    //   Redux experiment:
    //     { name: "...",
    //       variations: [
    //         { name: "Control"   componentProps: {} },
    //         { name: "Version A" componentProps: { children: "Even fancier text!" } },
    //         { name: "Version B" componentProps: { children: "BOLD fancy text!", style: { {fontStyle: 'bold'} } } },
    //         ...
    //       ]
    //     }
    //
    //   Equivalent component:
    //     <Experiment name="...">
    //       <Variation name="Control">    <h1>My fancy text here ...</h1>          </Variation>
    //       <Variation name="Version A">  <h1>Even fancier text!</h1>              </Variation>
    //       <Variation name="Version B">  <h1 style={{...}}>BOLD fancy text!</h1>  </Variation>
    //     </Experiment>
    //
    if (notVariationChildren) {
      return (
        <VariationContainer
          id={variation.get('id')}
          name={variation.get('name')}
          experiment={experiment}
          variation={variation}
          dispatchWin={dispatchWin}
          bindDispatchWin={bindDispatchWin}
          >
          {children}
        </VariationContainer>
      );
    }

    // Hash of "name" => Variation element
    const variationElements = mapChildrenToVariationElements(children);
    // Find the name in the hash
    const variationChildElement = variationElements[variation.get('name')];
    if (!variationChildElement) {
      return null;
    }

    // Inject the helper `handleWin` into the child element
    return React.cloneElement(variationChildElement, {
      experiment,
      variation,
      dispatchWin,
      bindDispatchWin,
      id:   variation.get('id'),
      name: variation.get('name'),
    });
  }
}


/**
 * Helper function: Convert `children` to a hash of { `name` => variation }
 */
const mapChildrenToVariationElements = (children) => {
  const variationElements = {};
  React.Children.forEach(children, element => variationElements[element.props.name] = element);
  return variationElements;
};
