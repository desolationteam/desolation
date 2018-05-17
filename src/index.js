import Application from './scripts/Application';
import 'normalize.css/normalize.css';
import './styles/styles.scss';
import './textures';
import './models';

const form = document.getElementById('form');
form.addEventListener('submit', () => {
	window.app = new Application(document.getElementById('nickname').value);
});
