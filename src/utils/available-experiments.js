import Immutable from 'immutable';

const availableExperiments = (experiments, audience_path, audience) => {
  return experiments.filter((experiment) => {
    // The audience must be exactly equal to, or more than audienceProps to be eligable
    const audienceProps = experiment.getIn(audience_path, Immutable.Map({}));
    return audienceProps.isEmpty() || audience.equal(audienceProps) || audience.isSuperset(audienceProps);
  });
};

export default availableExperiments;
