/** @flow */
import React from 'react';
import Immutable from 'immutable';
import { isVariationComponent } from '../../components/variation';
import Variation, { isVariationContainer } from '../../containers/variation';
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

const isValid = (child) => (isVariationContainer(child) || isVariationComponent(child));


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
    const { children, defaultVariationName } = this.props;
    const { experiment } = this.state;
    const variation = this.state.variation || Immutable.Map({ name: defaultVariationName, id: null });

    const childrenArray = React.Children.toArray(children);

    // If there are no children, render nothing
    if (childrenArray.length === 0) {
      return null;
    }

    // If the first child is text or an unknown component, simply wrap it in a Variation
    if (childrenArray.length === 1 && !isValid(childrenArray[0])) {
      return (
        <Variation id={variation.get('id')} name={variation.get('name')} experiment={experiment} variation={variation}>
          {children}
        </Variation>
      );
    }

    const selectedChild = [
      childrenArray.find( child => (variation.get('id')   && child.props.id   === variation.get('id'))   ),
      childrenArray.find( child => (variation.get('name') && child.props.name === variation.get('name')) ),
    ].filter( value => value ).find( value => value );
    if (!selectedChild) {
      throw new Error(`Expected to find a Variation child matching id=${variation.get('id')} or name=${variation.get('name')}`);
    }

    // Inject the helper `handleWin` into the child element
    return React.cloneElement(selectedChild, {
      experiment,
      variation,
      id:   variation.get('id'),
      name: variation.get('name'),
    });
  }
}
