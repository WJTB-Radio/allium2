import { FormEvent } from 'react';
import { useRecoilState } from 'recoil';
import { automationEnabledState } from './automation';
import { currentPageState } from './router';
import { ipcMain, ipcRenderer } from 'electron';

export default function DJ() {
	const [automationEnabled, setAutomationEnabled] = useRecoilState(automationEnabledState);

	function toggleAutomation() {
		setAutomationEnabled(!automationEnabled);
	}

	return <>
		<Login />
		<p>{automationEnabled ? 'Allium is controlling spotify.' : 'Allium is not controlling spotify.'}</p>
		<button onClick={toggleAutomation}>
			{automationEnabled ? 'Stop Automation' : 'Start Automation'}
		</button>
		<button onClick={() => {
			ipcRenderer.send('playBumpers', 3, '/home/julia/Music/bumpers');
			ipcRenderer.once('donePlayingBumpers', () => {
				console.log('done playing');
			});
		}}>test</button>
	</>
}

function Login() {
	const [_currentPage, setCurrentPage] = useRecoilState(currentPageState);
	function login(event: FormEvent) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form)
		const password = formData.get('password');
		if(password === 'shredded') {
			setCurrentPage('content_manager');
		} else if (password === 'shredded2') {
			setCurrentPage('admin');
		} else {
			form.reset();
		}
	}

	return <form onSubmit={login}>
		<label>
			password
			<input name='password' type='password' />
		</label>
		<button type='submit'>Login</button>
	</form>;
}