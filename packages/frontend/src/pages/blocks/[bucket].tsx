import Head from 'next/head';
import { NextPageWithLayout } from '@/pages/page';
import AuthedLayout from '@/layouts/authed/AuthedLayout';
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { ArrowBackIcon, SearchIcon } from '@chakra-ui/icons';
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
} from '@chakra-ui/react';
// import { File } from '@/lib/entities/file';
import Bucket from '@/lib/entities/bucket';
import Block from '@/lib/entities/block';
import NoBlockScreen from '@/components/utils/screens/NoBlockScreen';
import { useRouter } from 'next/router';
// import { db, storage } from '@/lib/firebase/client';
import AuthorizedRoute from '@/components/utils/routes/Authorized';
// import StatCard from '@/components/cards/stat/StatCard';
// import FileStatus from '@/components/status/file/FileStatus';
import CustomerList from '@/components/cards/customer/CustomerList';
import Filter from '@/images/icons/Filter';
// import FilterDrawer from '@/components/drawers/FilterDrawer';
// import StatusBadge from '@/components/status/upload/StatusBadge';
import { useAuth } from '@/contexts/session';
// import useIsMobile from '@/components/utils/device/useIsMobile';

export interface IBlockView {}

const customStyles = {
  headRow: {
    style: {
      borderTopWidth: '2px',
      borderTopColor: '#000',
      borderTopStyle: 'solid',
      borderBottomWidth: '2px',
      borderBottomColor: '#000',
      borderBottomStyle: 'solid',
      fontWeight: 700,
    },
  },
};

const BlockView: NextPageWithLayout<IBlockView> = ({}) => {
  const { user, worker } = useAuth();
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>([]);
  // const [upload, setUpload] = useState<any>(null);
  // const [files, setFiles] = useState<File[]>([]);
  // const [total_size, setTotalSize] = useState<number>(0);
  // const [manifestUrl, setManifestUrl] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const [minSize, setMinSize] = useState<number>(0);
  // const [maxSize, setMaxSize] = useState<number>(Infinity);
  // const [isMobile] = useIsMobile();

  useEffect(() => {
    // Get the upload ID from the URL. Its the last part of the URL
    const bucketId = router.asPath.split('/').pop();
    console.log(worker)
    if (bucketId && user && worker) {
      worker.ls(bucketId).then((blocks) => {
        // console.log(blocks);
        // Set the files
        setBlocks(blocks);
      });
    }
  }, [user, worker, router]);

  const blockViewColumns = [
    {
      name: 'BLOCK CID',
      selector: (row: Block) => row.cid,
      sortable: true,
      cell: (row: Block) => row.cid,
    },
    {
      name: 'BLOCK SIZE',
      selector: (row: Block) => row.size,
      sortable: true,
      cell: (row: Block) => row.size + ' B',
    },
  ];

  // TODO: Download a block and Remove a block from Expander
  // const ExpandedComponentFileView = () => (
  //   <div className="flex flex-row text-white">
  //     <button
  //       className="w-full bg-[#16181B]"
  //       onClick={() =>
  //         (window.location.href =
  //           'https://share.hsforms.com/1mvZF3awnRJC6ywL2aC8-tQe3p87')
  //       }
  //     >
  //       File Retrieval Request
  //     </button>
  //   </div>
  // );

  // TODO: Filter blocks by size / cid / codec / hash / etc
  const applyFilters = () => {
    let filtered = blocks;
    // if (minSize > 0 || maxSize > 0) {
    //   filtered = files.filter(
    //     (file) => file.size >= minSize && (maxSize <= 0 || file.size <= maxSize)
    //   );
    // }
    // if (searchQuery !== '') {
    //   const query = searchQuery.toLowerCase().trim();
    //   filtered = filtered.filter(
    //     (file) =>
    //       file.name.toLowerCase().includes(query) ||
    //       file.id.toLowerCase().includes(query)
    //   );
    //   console.log('search');
    // }
    return filtered;
  };

  return (
    <AuthorizedRoute>
      { blocks.length > 0 ? (
        <>
          <div className="border-t-2 border-t-[#000] pb-44">
            <div className="flex mt-4">
              {/* @ts-ignore */}
              <Button
                ml={4}
                colorScheme="blue"
                variant="solid"
                onClick={() => router.push('/')}
              >
                <ArrowBackIcon />
                All Buckets
              </Button>
            </div>
          </div>
          <DataTable
            columns={blockViewColumns}
            data={applyFilters()}
            customStyles={customStyles}
          />
        </>
      ) : (
        <NoBlockScreen />
      )}
    </AuthorizedRoute>
  );
};

export default BlockView;

BlockView.getLayout = (page) => {
  return <AuthedLayout>{page}</AuthedLayout>;
};
