import { configure, setAddon } from '@kadira/storybook';
import addStoriesGroup from 'react-storybook-addon-add-stories-group';
import infoAddon from '@kadira/react-storybook-addon-info';
setAddon(addStoriesGroup);
setAddon(infoAddon);

const req = require.context('../src', true, /\.story\.js$/);
function loadStories() {
  req.keys().sort().forEach(req);
}

configure(loadStories, module);
