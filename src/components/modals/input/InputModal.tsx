import React from 'react';
import {
	Modal,
	ModalOverlay,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	Stack,
	ModalFooter,
	Button,
	ModalContent,
} from '@chakra-ui/react';

export interface IInputModal {
	isOpen: boolean;
	title: string;
	description: string;
	error: string;
	onInputChange: any;
	inputId: string;
	inputPlaceholder: string;
	onClose: () => void;
	onClickCancel: () => void;
	onClickSave: () => void;
}

const ChangeModal: React.FC<IInputModal> = ({
	isOpen,
	title,
	description,
	error,
	onInputChange,
	inputId,
	inputPlaceholder,
	onClose,
	onClickCancel,
	onClickSave
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			{/*@ts-ignore*/}
			<ModalContent>
				<ModalHeader>{title}</ModalHeader>
				<ModalBody>{description}</ModalBody>
				<ModalCloseButton />
				<ModalBody>
					<Stack spacing={2}>
						<input
							id={inputId}
							type="text"
							placeholder={inputPlaceholder}
							className={`input border-[#E9E9EA] border-2 rounded-sm focus:outline-none w-full px-3`}
							onChange={onInputChange}
						/>
						{error && <div className="flex text-red-500">{error}</div>}
					</Stack>
				</ModalBody>
				<ModalFooter>
					<Button
						colorScheme="black"
						mr={3}
						onClick={onClickCancel}
						variant="outline"
						fontWeight="medium"
						borderWidth="2px"
					>
						Cancel
					</Button>
					<Button
						variant="ghost"
						textColor="#00143173"
						bg="#CED6DE"
						fontWeight="medium"
						onClick={onClickSave}
					>
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default ChangeModal;
