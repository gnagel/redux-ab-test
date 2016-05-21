/** @flow */
import React from "react";
import Variant from "./Variant";
import { actions } from './module';


type Props = {
  name: string,
  defaultVariantName: React.PropTypes.string,
  variantName: ?string,
  emitActivate: Function,
  emitDeactivate: Function,
  emitWin: Function,
  emitPlay: Function,
};
type State = {
  variantElements: Object,
  variantName: ?string
};

export class Experiment extends React.Component {
  props: Props;
  state: State;

  constructor(props, context) {
    super(props, context);
  }

  /**
   * Create the default state
   */
  getInitialState() {
    return createNewState(this.props);
  }


  /**
   * Update the component's state with the new properties
   */
  componentWillReceiveProps(nextProps) {
    this.setState(this.createNewState(nextProps));
  }


  /**
   * Activate the input variant
   */
  componentWillMount() {
    const { name, variantName, store } = this.props;
    store.dispatch(actions.activate(name, variantName));
    store.dispatch(actions.play(name, variantName));
    this.setState(this.createNewState({ variantName }));
  }


  /**
   * Deactivate the variant from the state
   */
  componentWillUnmount() {
    const { name, store } = this.props;
    store.dispatch(actions.deactivate(name));
  }


  /**
   * Render one of the variants or `null`
   */
  render() {
    const { variantName, variantElements } = this.state;
    return variantElements[variantName] || null;
  }


  createNewState(props) {
    let variantElements = Immutable.Map({});
    const { children } = props;
    React.Children.forEach(children, ensureElementIsVariant);
    React.Children.forEach(children, element => { variantElements = variantElements.set(element.props.name, element) });

    const variantName = props.variantName || this.props.variantName;
    if (variantName && !variantElements[variantName]) {
      throw new Error(`The variantName: '${variantName}' was not found in variantElements=${ variantName.keys() }`);
    }

    return { variantElements, variantName };
  }

}



//
// Helpers:
//

const ensureElementIsVariant = (element) => {
  if(!React.isValidElement(element) || element.type.displayName !== "Variant") {
    throw new Error("The children of an Experiment must be Variant components");
  }
}
