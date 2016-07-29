/** @flow */
import React from "react";
import Immutable from 'immutable';
import VariationComponent from '../../components/variation';
import VariationContainer from '../../containers/variation';
import selectVariation from '../../utils/select-variation';
import { cacheStore } from '../../utils/create-cache-store';

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
   * ID of the experiment
   */
  id: ?string,
  /**
   * Name of the experiment
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
};


export default class Experiment extends React.Component {
  props: Props;
  state: State;
  static defaultProps = {
    reduxAbTest:          Immutable.Map({}),
    id:                   null,
    name:                 'Default Experiment Name',
    defaultVariationName: null,
    dispatchActivate:     () => {},
    dispatchDeactivate:   () => {},
    dispatchPlay:         () => {},
    dispatchWin:          () => {},
  };
  state = {
    variation:  null,
    experiment: null,
  };


  /**
   * Activate the variation
   */
  componentWillMount() {
    const { id, name, defaultVariationName, reduxAbTest, dispatchActivate, dispatchPlay } = this.props;
    const experiment = reduxAbTest.getIn(['availableExperiments', id || name], null);
    const variation = selectVariation({
      reduxAbTest,
      experiment,
      defaultVariationName,
      cacheStore
    });

    // These will trigger `componentWillReceiveProps`
    dispatchActivate({experiment});
    dispatchPlay({experiment, variation});
    this.setState({ experiment, variation });
  }


  /**
   * Update the component's state with the new properties
   */
  componentWillReceiveProps(nextProps:Props) {
    const { name, defaultVariationName, reduxAbTest } = nextProps;
    const experiment = reduxAbTest.getIn(['availableExperiments', id || name], null);
    const variation = selectVariation({
      reduxAbTest,
      experiment,
      defaultVariationName,
      cacheStore
    });

    if (!experiment.equals(this.state.experiment) || !variation.equals(this.state.variation)) {
      this.setState({ experiment, variation });
    }
  }


  /**
   * Deactivate the variation from the state
   */
  componentWillUnmount() {
    const { dispatchDeactivate } = this.props;
    const { experiment } = this.state;
    // Dispatch the deactivation event
    dispatchDeactivate({experiment});
  }


  /**
   * Render one of the variations or `null`
   */
  render() {
    const { name, children } = this.props;
    const { experiment, variation } = this.state;
    if (!variation) {
      return null;
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
    if (React.Children.count(children) === 1 && (!React.isValidElement(children) || React.Children.only(children).type !== VariationComponent || React.Children.only(children).type !== VariationContainer)) {
      return (
        <VariationContainer
          id={variation.get('id')}
          name={variation.get('name')}
          experiment={experiment}
          variation={variation}>
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
      id: variation.get('id'),
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
