
const experimentKey = experiment => (experiment.get('id', null) || experiment.get('name', null));
export default experimentKey;
