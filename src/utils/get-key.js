
const experimentKey = experiment => (experiment.has('id') ? experiment.get('id') : experiment.get('name'));
export default experimentKey;
