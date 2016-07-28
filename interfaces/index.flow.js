
// Flow type interfaces:
declare type VariationType { id: ?string, name: string, weight: number };
declare type ExperimentType { id: ?string, name: string, variations: Array<VariationType> };
declare type WrapsExperimentType { experiment: any };
declare type WrapsExperimentVariationType = { experiment: any, variation: any };

declare function recievesExperiment(opts:WrapsExperimentType): void;
declare function recievesExperimentVariation(opts:WrapsExperimentVariationType): void;


// React Connected components
declare interface Experiment  extends React.Component<*, *, *>;
declare interface Variation extends React.Component<*, *, *>;
declare interface Debugger extends React.Component<*, *, *>;

// Redux Reducer
declare function reduxAbTest(state: any, payload: any): any;
declare type reduxAbTestInitialState: any;
declare function reduxAbTestMiddleware(any): any;

// Redux Action Creators
declare function reset(): any;
declare function load(opts: (experiments:, active: Object, types_path: ?Array<string>)): any;

// Redux Action Types
declare type WIN: string;
declare type PLAY: string;
