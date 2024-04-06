import { createRoot } from 'react-dom/client';
import './router';
import { RecoilRoot } from 'recoil';
import { RouterOutlet } from './router';
import Automation from './automation';

function App() {
	return <RecoilRoot>
		<Automation />
		<RouterOutlet />
	</RecoilRoot>
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);