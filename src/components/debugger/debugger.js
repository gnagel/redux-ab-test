/** @flow */
import React from 'react';
import Immutable from 'immutable';

import classes from './debugger.css';


type Props = {
  disabled: boolean,
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
   * Bound Action Creator: activate(experimentName:string)
   */
  dispatchActivate: Function,
  /**
   * Bound Action Creator: deactivate(experimentName:string)
   */
  dispatchDeactivate: Function,
  /**
  * Bound Action Creator: play(experimentName:string, variationName:string)
   */
  dispatchPlay: Function,
  /**
   * Bound Action Creator: win(experimentName:string, variationName:string)
   */
  dispatchWin: Function,
};

type State = {
  isOpen: ?boolean,
};

export default class Debugger extends React.Component {
  props: Props;
  state: State;

  constructor(props, context) {
    super(props, context);
    this.state = { isOpen: false };
  }

  toggleVisibility() {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  }

  render() {
    const { reduxAbTest, disabled } = this.props;
    if (disabled) {
      return null;
    }
    const { isOpen } = this.state;
    const experiments = reduxAbTest.get('experiments');
    const experimentNames = experiments.map( experiment => experiment.get('name') ).toJS();
    const experimentNamesCount = experimentNames.length;
    const toggleVisibility = this.toggleVisibility.bind(this);

    if (isOpen) {
      return (
        <div className='redux-ab-test--debugger'>
          <div className='container panel'>
            <div onClick={toggleVisibility} className='close'>×</div>
            <div>{ experiments.map(this.renderExperiment.bind(this)) }</div>
            <div className='production_build_note'>This panel is hidden on production builds.</div>
          </div>
          <style>
            { classes() }
          </style>
        </div>
      );
    }

    // Render the collapsed panel
    if (experimentNamesCount > 0) {
      const text = `${experimentNamesCount} Active Experiment${experimentNamesCount > 1 ? "s" : ""}`;
      return (
        <div className='redux-ab-test--debugger'>
          <div onClick={toggleVisibility} className='container handle'>
            {text}
          </div>
          <style>
            { classes() }
          </style>
        </div>
      );
    }

    // Not isOpen, and no registered experiments:
    return null;
  }

  renderExperiment(experiment) {
    const experimentName = experiment.get('name');
    const variations = experiment.get('variations');
    const variationNames = variations.map( variation => variation.get('name') ).toJS();
    if (variationNames.length === 0) {
      return null;
    }

    return (
      <div className='experiment' key={experimentName}>
        <div className='experiment_name'>{experimentName}</div>
        <ul>
          { variations.map(this.renderVariation.bind(this, experiment)) }
        </ul>
      </div>
    );
  }

  renderVariation(experiment, variation) {
    const { reduxAbTest, dispatchActivate } = this.props;
    const experimentName = experiment.get('name');
    const variationName = variation.get('name');
    const active = reduxAbTest.get('active').get(experiment.get('name'), null) === variation.get('name');
    const setActivevariation = () => dispatchActivate({experiment, variation});
    return (
      <li key={variationName}>
        <label onClick={setActivevariation} className={`${active ? 'active' : 'label'}`}>
          <input type="radio" name={experimentName} value={variationName} defaultChecked={active} />
          {variationName}
        </label>
     </li>
    );
  }
}
