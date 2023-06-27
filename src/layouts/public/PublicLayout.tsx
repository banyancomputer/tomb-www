import styles from './PublicLayout.module.css';
import React from 'react';

export interface IPublicLayout {}
// @ts-ignore
const PublicLayout: React.FC<IPublicLayout> = ({ children }) => {
	return (
		<>
			<div className="fixed h-screen w-full">
				<main className={styles.main}>{children}</main>
			</div>
		</>
	);
};

export default PublicLayout;
