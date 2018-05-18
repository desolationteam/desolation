import Application from './scripts/Application';
import 'normalize.css/normalize.css';
import './styles/styles.scss';
import './textures';
import './models';
import './sounds';

const form = document.getElementById('form');
form.addEventListener('submit', () => {
	//todo: check for unique name
	window.app = new Application(document.getElementById('nickname').value);
});
