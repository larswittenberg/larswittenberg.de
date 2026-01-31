const normalizeFlag = (value?: string | null): string => (value ?? '').trim().toLowerCase();

const isTruthyFlag = (value?: string | null): boolean => {
	const normalized = normalizeFlag(value);

	return ['1', 'true', 'yes', 'on', 'debug'].includes(normalized);
};

export const isDebuggingEnabled = (): boolean => {
	if (isTruthyFlag(process.env.NEXT_PUBLIC_ENABLE_GITHUB_DEBUG)) {
		return true;
	}

	return isTruthyFlag(process.env.ENABLE_GITHUB_DEBUG);
};

type PrimitiveDetail = string | number | boolean | null;

export type DebugDetails = Record<string, unknown> | PrimitiveDetail;

export type DebugLevel = 'info' | 'warn' | 'error';

export type DebugEvent = {
	context: string;
	level: DebugLevel;
	message: string;
	details?: DebugDetails;
	timestamp: number;
};

type DebugCollector = {
	enabled: boolean;
	info: (message: string, details?: DebugDetails) => void;
	warn: (message: string, details?: DebugDetails) => void;
	error: (message: string, details?: DebugDetails) => void;
	log: (level: DebugLevel, message: string, details?: DebugDetails) => void;
	collect: () => DebugEvent[];
};

const resolveConsoleMethod = (level: DebugLevel): typeof console.log => {
	switch (level) {
		case 'warn':
			return console.warn;
		case 'error':
			return console.error;
		default:
			return console.log;
	}
};

const serializeDebugDetails = (details?: DebugDetails): DebugDetails | undefined => {
	if (details instanceof Error) {
		return {
			name: details.name,
			message: details.message,
			stack: details.stack,
		};
	}

	return details;
};

export const createDebugCollector = (context: string): DebugCollector => {
	const enabled = isDebuggingEnabled();
	const events: DebugEvent[] = [];

	const log = (level: DebugLevel, message: string, details?: DebugDetails) => {
		if (!enabled) {
			return;
		}

		events.push({
			context,
			level,
			message,
			details: serializeDebugDetails(details),
			timestamp: Date.now(),
		});
	};

	return {
		enabled,
		log,
		info: (message, details) => log('info', message, details),
		warn: (message, details) => log('warn', message, details),
		error: (message, details) => log('error', message, details),
		collect: () => (enabled ? [...events] : []),
	};
};

export const formatErrorForDebug = (error: unknown): DebugDetails => {
	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
		};
	}

	return {
		type: typeof error,
		value: error,
	};
};

export const emitConsoleDebug = (context: string, level: DebugLevel, message: string, details?: DebugDetails) => {
	if (!isDebuggingEnabled()) {
		return;
	}

	const log = resolveConsoleMethod(level);
	const prefix = '[GitHub Debug]';
	const header = `${prefix} ${context} → ${message}`;

	if (details !== undefined) {
		log(header, details);

		return;
	}

	log(header);
};
