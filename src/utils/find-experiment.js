/**
 * Find the experiment by name, raises an Error if not-found
 */
export default function findExperiment({reduxAbTest, experimentName}) {
  const experiment = reduxAbTest.get('experiments').find( experiment => experiment.get('name') == experimentName );
  if (!experiment) {
    throw new Error(`The experimentName: '${experimentName}' was not found in experiments=${ reduxAbTest.get('experiments') }`);
  }
  return experiment;
};
