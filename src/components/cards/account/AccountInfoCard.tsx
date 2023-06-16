import React from 'react';
export interface AccountInfo {
  // name: string;
  // phoneNumber: string;
  // companyName: string;
  // jobTitle: string;
  uid: string;
}

const AccountInfoCard: React.FC<AccountInfo> = ({
  // name,
  // phoneNumber,
  // companyName,
  // jobTitle,
  uid,
}) => {
  return (
    <>
      <div className="text-2xl font-medium mb-4">Account Info</div>
      <div className="border-b-2 border-b-black pt-2 pb-2 flex">
        UID
        <div className="ml-4 text-slate-600">{uid}</div>
      </div>
    </>
  );
};

export default AccountInfoCard;
