/** @flow */
import React from 'react';
import ReactDOM from 'react-dom';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions } from './module';


const disabled = process.env.NODE_ENV === "production" || !canUseDOM;

type Props = {
  visible: ?boolean,
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
   * Bound Action Creator: actions.activate(experimentName:string)
   */
  dispatchActivate: Function,
  /**
   * Bound Action Creator: actions.deactivate(experimentName:string)
   */
  dispatchDeactivate: Function,
  /**
  * Bound Action Creator: actions.play(experimentName:string, variationName:string)
   */
  dispatchPlay: Function,
  /**
   * Bound Action Creator: actions.win(experimentName:string, variationName:string)
   */
  dispatchWin: Function,
};
type State = {
  visible: boolean,
};

export default class Debugger extends React.Component {
  props: Props;
  state: State;

  constructor(props, context) {
    super(props, context);
    this.state = { visible: props.visible };
  }

  toggleVisibility() {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  }

  render() {
    if (disabled) {
      return null;
    }

    const { reduxAbTest } = this.props;
    const { visible } = this.state;
    const experiments = reduxAbTest.get('experiments');
    const experimentNames = experiments.map( experiment => experiment.get('name') ).toJS();
    const experimentNamesCount = experimentNames.length;
    const toggleVisibility = this.toggleVisibility.bind(this);

    if (visible) {
      return (
        <div style={ {...styles_container, ...styles_panel} }>
          <div onClick={toggleVisibility} style={styles_close}>×</div>
          <div>{ experiments.map(this.renderExperiment.bind(this)) }</div>
          <div style={ styles_production_build_note }>This panel is hidden on production builds.</div>
        </div>
      );
    }

    // Render the collapsed panel
    if (experimentNamesCount > 0) {
      const text = `${experimentNamesCount} Active Experiment${experimentNamesCount > 1 ? "s" : ""}`;
      return (
        <div onClick={toggleVisibility} style={ {...styles_container, ...styles_handle} }>
          {text}
        </div>
      );
    }

    // Not visible, and no registered experiments:
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
      <div style={styles_experiment} key={experimentName}>
        <div style={styles_experiment_name}>{experimentName}</div>
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
        <label onClick={setActivevariation} style={ active ? styles_label_active : styles_label }>
          <input type="radio" name={experimentName} value={variationName} defaultChecked={active} />
          {variationName}
        </label>
     </li>
    );
  }
};



export const mapStateToProps = (state) => {
  const { reduxAbTest } = state;
  return { reduxAbTest };
}

export const mapDispatchToProps = (dispatch) => {
  return {
    dispatchActivate: bindActionCreators(actions.activate, dispatch),
    dispatchDeactivate: bindActionCreators(actions.deactivate, dispatch),
    dispatchPlay: bindActionCreators(actions.play, dispatch),
    dispatchWin: bindActionCreators(actions.win, dispatch),
  };
};

export const RawDebugger = Debugger;
export default connect(mapStateToProps, mapDispatchToProps)(Debugger);



const styles = {
  zIndex: "25000",
  position: "fixed",
  transform: "translateX(-50%)",
  bottom: "0",
  left: "50%",
};
const styles_ul = {
  margin: "0",
  padding: "0 0 0 20px",
};
const styles_li = {
  margin: "0",
  padding: "0",
  fontSize: "14px",
  lineHeight: "14px",
};
const styles_input = {
  float: "left",
  margin: "0 10px 0 0",
  padding: "0",
  cursor: "pointer",
  color: "#999999",
  margin: "0 0 10px 0",
  cursor: "pointer",
  fontWeight: "normal",
};
const styles_label = {
  transition: "all .25s",
};
const styles_label_active = {
  ...styles_label,
  color: "#000000",
};
const styles_experiment = {};
const styles_experiment_name = {
  fontSize: "16px",
  color: "#000000",
  margin: "0 0 10px 0",
};
const styles_production_build_note = {
  fontSize: "10px",
  color: "#999999",
  textAlign: "center",
  margin: "10px -40px 0 -10px",
  borderTop: "1px solid #b3b3b3",
  padding: "10px 10px 5px 10px",
};
const styles_handle = {
  cursor: "pointer",
  padding: "5px 10px 5px 10px",
};
const styles_panel = {
  padding: "15px 40px 5px 10px",
};
const styles_container = {
  fontSize: "11px",
  backgroundColor: "#ebebeb",
  color: "#000000",
  boxShadow: "0px 0 5px rgba(0, 0, 0, 0.1)",
  borderTop: "1px solid #b3b3b3",
  borderLeft: "1px solid #b3b3b3",
  borderRight: "1px solid #b3b3b3",
  borderTopLeftRadius: "2px",
  borderTopRightRadius: "2px",
};
const styles_close = {
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  color: "#CC0000",
  // position: "absolute",
  top: "0px",
  right: "7px",
  transition: "all .25s",
};
const styles_close_hover = {
  ...styles_close,
  color: "#FF0000",
};
