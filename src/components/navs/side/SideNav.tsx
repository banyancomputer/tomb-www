import React, { useState } from 'react';
import Link from 'next/link';
import AlphaTag from '../../../images/tags/AlphaTag';
import BrandLogo from '@/images/icons/BrandLogo';
import BrandWordmark from '@/images/icons/BrandWordmark';
import Dashboard from '@/images/icons/Dashboard';
import NavItem from '../../items/nav/NavItem';
import Account from '@/images/icons/Account';
import Disconnect from '@/images/icons/Disconnect';
import { CloseIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import { useAuth } from '@/contexts/session';

// TOOD

const navItemsUpper = [
	{
		label: 'Dashboard',
		href: '/',
		icon: Dashboard,
	},
	{
		label: 'Account',
		href: '/account',
		icon: Account,
	},
];

export interface ISideNav {}
// @ts-ignore
const SideNav: React.FC<ISideNav> = ({ children }) => {
	const { logOut } = useAuth();
	const [checked, setChecked] = useState(false);
	const navItemsLower = [
		{
			label: 'Log Out',
			callback: async () => {
				await logOut();
				window.location.href = window.location.origin;
			},
			icon: Disconnect,
			placement: 'bottom',
		},
	];
	const handleCloseDrawer = (): void => {
		setChecked(false);
	};
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked);
	};
	return (
		<div className="drawer drawer-mobile h-screen">
			<input
				id="sidebar-nav"
				className="drawer-toggle"
				type="checkbox"
				checked={checked}
				onChange={handleChange}
			/>
			<div className="drawer-content flex flex-col">{children}</div>
			<div className="drawer-side">
				<label
					htmlFor="sidebar-nav"
					className="drawer-overlay !bg-[#262626] !opacity-[.85]"
				/>
				<div className="menu p-4 overflow-y-auto w-70 bg-base-100 text-base-content border-r border-r-black">
					{/* Brand */}
					<div className="flex items-center gap-2 cursor-pointer mb-8">
						<BrandLogo />
						<BrandWordmark />
						<AlphaTag />
						<div className="xs:block xs:ml-auto lg:hidden">
							<IconButton
								aria-label="Exit Nav"
								fontSize={20}
								icon={<CloseIcon />}
								onClick={() => {
									handleCloseDrawer();
								}}
							/>
						</div>
					</div>
					{/* Upper Menu */}
					<ul className="mt-auto ">
						{navItemsUpper.map((item, key) => (
							<NavItem
								item={item}
								key={key}
								handleCloseDrawer={handleCloseDrawer}
							/>
						))}
					</ul>
					{/* Lower Menu */}
					<ul className="mt-auto">
						<div>
							{navItemsLower.map((item, key) => (
								// @ts-ignore
								<NavItem item={item} key={key} />
							))}
						</div>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default SideNav;
