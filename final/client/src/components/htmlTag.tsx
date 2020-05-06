import React from 'react';

interface WithChildren {
	children?: React.ReactNode;
}

export const Input: React.FC<WithChildren> = ({ children, ...props }) => (
	<input {...props}>{children}</input>
);

export const Select: React.FC<WithChildren> = ({ children, ...props }) => (
	<select {...props}>{children}</select>
);
