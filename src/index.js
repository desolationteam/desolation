import Application from './scripts/Application';
import 'normalize.css/normalize.css';
import './styles/styles.scss';
import './textures';
import './models';

const form = document.getElementById('form');
const startButton = document.getElementById('start');
const nicknameInput = document.getElementById('nickname');

startButton.addEventListener('click', () => {
	const nickname = nicknameInput.value;
	if (nickname.length) {
		form.classList = 'hide';
		window.app = new Application(nickname);
	}
});
