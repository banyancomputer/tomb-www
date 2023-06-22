import { ArrowForwardIcon, Icon } from '@chakra-ui/icons';
import { HStack } from '@chakra-ui/react';
import React from 'react';
import { SiTwitter, SiMedium, SiInstagram, SiDiscord } from 'react-icons/si';
import Link from 'next/link';

const NoBlockScreen = () => {
	return (
		<div className="h-screen flex justify-center content-center">
			<div className="text-xl font-medium mt-auto mb-auto">
				You don&apos;t have any blocks in this bucket.
			</div>
		</div>
	);
};

export default NoBlockScreen;
