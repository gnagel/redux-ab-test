/** @flow */
import React from "react";
import warning from 'fbjs/lib/warning';
import crc32 from "fbjs/lib/crc32";

import emitter from "./emitter";
import Variant from "./Variant";
import { actions } from './module';

type ValueType = string | Function

type Props = {
  name: string,
  defaultVariantName: React.PropTypes.string,
  value: ValueType,
  emitActivate: Function,
  emitDeactivate: Function,
  emitWin: Function,
  emitPlay: Function,
};
type State = {
  variants: Object,
  value: ?string
};

export class Experiment extends React.Component {
  props: Props;

  constructor(props, context) {
    super(props, context);
    this.state = { variants: {} };
  }

  win() {
    const { emitWin, name } = this.props;
    emitWin(name);
  }

  play() {
    const { emitPlay, name } = this.props;
    emitPlay(name);
  }


  getInitialState() {
    return createNewState(this.props);
  }


  createNewState(props) {
    const value = this.resolveClosure(props.value || this.props.value);

    const { children } = props;
    const variants = {};
    React.Children.forEach(children, (element) => {
      // Guarentee this is a Variant component
      this.ensureElementIsVariant(element);

      const { name } = element.props;
      variants[name] = element;
      emitter.addExperimentVariant(this.props.name, element.props.name);
    });
    emitter.emit("variants-loaded", this.props.name);

    return { variants, value };
  }


  ensureElementIsVariant(element) {
    if(!React.isValidElement(element) || element.type.displayName !== "Variant") {
      throw new Error("The children of an Experiment must be Variant components");
    }
  }


  getLocalStorageValue() {
    const activeValue = emitter.getActiveVariant(this.props.name);
    if(typeof activeValue === "string") {
      return activeValue;
    }
    const storedValue = store.getItem('PUSHTELL-' + this.props.name);
    if(typeof storedValue === "string") {
      emitter.setActiveVariant(this.props.name, storedValue, true);
      return storedValue;
    }
    if(typeof this.props.defaultVariantName === 'string') {
      emitter.setActiveVariant(this.props.name, this.props.defaultVariantName);
      return this.props.defaultVariantName;
    }
    const variants = emitter.getSortedVariants(this.props.name);
    const weights = emitter.getSortedVariantWeights(this.props.name);
    const weightSum = weights.reduce((a, b) => {return a + b;}, 0);
    let weightedIndex = typeof this.props.userIdentifier === 'string' ? Math.abs(crc32(this.props.userIdentifier) % weightSum) : Math.floor(Math.random() * weightSum);
    let randomValue = variants[variants.length - 1];
    for (let index = 0; index < weights.length; index++) {
      weightedIndex -= weights[index];
      if (weightedIndex < 0) {
        randomValue = variants[index];
        break;
      }
    }
    emitter.setActiveVariant(this.props.name, randomValue);
    return randomValue;
  }


  componentWillReceiveProps(nextProps) {
    this.setState(this.createNewState(nextProps));
  }

  resolveClosure(value) {
    return value === "function" ? value() : value;
  }


  componentWillMount() {
    let value = resolveClosure(this.props.value);
    if(!this.state.variants[value]) {
      if ("production" !== process.env.NODE_ENV) {
        warning(true, 'Experiment “' + this.props.name + '” does not contain variant “' + value + '”');
      }
    }
    const { name, store } = this.props;
    const { }
    store.dispatch(actions.activate(name));

    emitter.setActiveVariant(this.props.name, value);
    emitter._emitPlay(this.props.name, value);
    this.setState({
      value: value
    });
    this.valueSubscription = emitter.addActiveVariantListener(this.props.name, (experimentName, variantName) => {
      this.setState({
        value: variantName
      });
    });
  }

  componentWillUnmount() {
    const { emitDeactivate, name } = this.props;
    emitDeactivate(name);
    // TODO: remove me
    this.valueSubscription.remove();
  }

  render() {
    const { value, variants } = this.state;
    return variants[value] || null;
  }
}







let store;

const noopStore = {
  getItem: function(){},
  setItem: function(){}
};

if(typeof window !== 'undefined' && 'localStorage' in window && window['localStorage'] !== null) {
  try {
    let key = '__pushtell_react__';
    window.localStorage.setItem(key, key);
    if (window.localStorage.getItem(key) !== key) {
      store = noopStore;
    } else {
      window.localStorage.removeItem(key);
      store = window.localStorage;
    }
  } catch(e) {
    store = noopStore;
  }
} else {
  store = noopStore;
}

emitter.addActiveVariantListener(function(experimentName, variantName, skipSave){
  if(skipSave) {
    return;
  }
  store.setItem('PUSHTELL-' + experimentName, variantName);
});

});
