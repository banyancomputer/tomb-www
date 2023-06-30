import styles from './AuthedLayout.module.css';
import SideNav from '@/components/navs/side/SideNav';

// TODO: This should pass the auth context to the side nav

export interface IAuthedLayout {}
// @ts-ignore
const AuthedLayout: React.FC<IAuthedLayout> = ({ children }) => {
	return (
		<main className={styles.main}>
			<SideNav>{children}</SideNav>
		</main>
	);
};

export default AuthedLayout;
