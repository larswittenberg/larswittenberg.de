'use client';

import { useActionState, useId } from 'react';
import { Lock } from 'lucide-react';
import { Input } from '@/components/projects/github-stars/ui/input';
import { Label } from '@/components/projects/github-stars/ui/label';
import { Button } from '@/components/projects/github-stars/ui/button';
import { login, type LoginState } from '@/app/projekte/strava/actions';

const initialState: LoginState = { error: null };

export function StravaLoginForm() {
	const [state, formAction, isPending] = useActionState(login, initialState);
	const passwordId = useId();
	const errorId = useId();

	return (
		<section className="max-w-sm rounded-lg border border-gray-200 p-6 dark:border-gray-700">
			<h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
				<Lock className="h-4 w-4" aria-hidden="true" />
				Alle Aktivitäten ansehen
			</h2>
			<p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
				Die Liste, Filter und Details sind passwortgeschützt.
			</p>
			<form action={formAction} className="space-y-3">
				{/* Honeypot: hidden from users, bots tend to fill it. */}
				<div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
					<label>
						Website
						<input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
					</label>
				</div>
				<div className="space-y-1">
					<Label htmlFor={passwordId}>Passwort</Label>
					<Input
						id={passwordId}
						name="password"
						type="password"
						required
						maxLength={256}
						autoComplete="current-password"
						aria-invalid={Boolean(state.error)}
						aria-describedby={state.error ? errorId : undefined}
						className="h-10"
					/>
				</div>
				{state.error && (
					<p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
						{state.error}
					</p>
				)}
				<Button
					type="submit"
					disabled={isPending}
					className="w-full bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
				>
					{isPending ? 'Prüfe…' : 'Anmelden'}
				</Button>
			</form>
		</section>
	);
}
