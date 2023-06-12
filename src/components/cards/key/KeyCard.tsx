import React from 'react';
import IKey from '@/lib/entities/accessKey'

interface IKeyCard {
    id: string, value: string
}

const KeyCard: React.FC<IKeyCard> = ({
  id, value
}) => {
  return (
    <>
      <div className="border-b-2 border-b-black pt-2 pb-2 flex">
        ID
        <div className="ml-4 text-slate-600">{id}</div>
        {/* Add some space */}
        &nbsp;
        Value
        <div className="ml-4 text-slate-600">{value}</div>
      </div>
      {/* <div className="border-b-2 border-b-black pt-2 pb-2 flex">
        
      </div> */}
    </>
  );
};

export default KeyCard;
