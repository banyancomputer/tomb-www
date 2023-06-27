import React from 'react';

interface IKeyCard {
	id: string;
	value: string;
}

const KeyCard: React.FC<IKeyCard> = ({ id }) => {
	return (
		<>
			<div className="border-b-2 border-b-black pt-2 pb-2 flex">
				Fingerprint
				<div className="ml-4 text-slate-600">{id}</div>
			</div>
		</>
	);
};

export default KeyCard;
