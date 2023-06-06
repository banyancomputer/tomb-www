export interface PrivNode {
  name: string;
  cid: string;
  parentcid: string;
  data?: any;
}

export enum PrivLinkType {
  FILE = 'FILE',
  DIRECTORY = 'DIRECTORY',
}

export interface PrivNodeLink {
  name: string;
  cid: string;
  type: PrivLinkType;
}

export const linksFromPrivNode = (
  node: PrivNode,
): [PrivNodeLink, PrivNodeLink[], PrivNodeLink[]] => {
  // GEnerate two random cid
  const cid1 = 'baf' + Math.random().toString(36).substring(7);
  const cid2 = 'baf' + Math.random().toString(36).substring(7);
  return [
    {
     name: '..',
     cid: node.parentcid, 
     type: PrivLinkType.DIRECTORY,
    },
    [
       {
          name: "dir",
          cid: cid1,
          type: PrivLinkType.DIRECTORY 
        }
    ],
    [
       {
          name: "file",
          cid: cid2,
          type: PrivLinkType.FILE 
        }
    ]
  ]
}

import Head from 'next/head';
import { NextPageWithLayout } from '@/pages/page';
import AuthedLayout from '@/components/layouts/authed/AuthedLayout';
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
import { firestore } from '@/lib/firebase';
// import { db, storage } from '@/lib/firebase/client';
import AuthorizedRoute from '@/components/utils/routes/Authorized';
import StatCard from '@/components/cards/stat/StatCard';
import FileStatus from '@/components/status/file/FileStatus';
import CustomerList from '@/components/cards/customer/CustomerList';
import Filter from '@/images/icons/Filter';
import FilterDrawer from '@/components/drawers/FilterDrawer';
import StatusBadge from '@/components/status/upload/StatusBadge';
import { useAuth } from '@/contexts/auth';
import useIsMobile from '@/components/utils/device/useIsMobile';
import { set } from 'cypress/types/lodash';

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

const defaultPrivNode: PrivNode = {
  name: 'dir',
  cid: 'badchildcid',
  parentcid: 'badparentcid',
  data: {},
};

export interface IFilesView {
}

const FilesView: NextPageWithLayout<IFilesView> = ({}) => {
  const router = useRouter();
  const { workerClient } = useAuth();

  let [ bucketId, setBucketId ] = useState<string>('');
  let [ path_Str , setPath_Str ] = useState<string>('');
  let [ rootCid, setRootCid ] = useState<string>('');
  let [ paths, setPaths ] = useState<string[]>([]);
  let [ privRef, setPrivRef ] = useState<any>(null);
  let [ privNode, setPrivNode ] = useState<PrivNode | null>(null);
  // let [ visitedNodes, setVisitedNodes ] = useState<{}>([]);
  // A mapping from paths to visited nodes
  let [ visitedNodes, setVisitedNodes ] = useState<{ [path: string]: PrivNode }>({});
  let [ parentLink, setParentLink ] = useState<PrivNodeLink | null>(null);
  // let [ childLinks, setChildLinks ] = useState<PrivNodeLink[]>([]);
  let [ dirLinks, setDirLinks ] = useState<PrivNodeLink[]>([]);
  let [ fileLinks, setFileLinks ] = useState<PrivNodeLink[]>([]);

  /* Effects */

  // Set the bucket Id and root CID
  useEffect(() => {
    const init = async () => {
      const bucketId = router.asPath.split('/').pop();
      setBucketId(bucketId as string);
      const bucket = await firestore.getBucket(bucketId as string);
      setRootCid(bucket.data.rootCid);
    }
    init().
      catch((err) => {
        console.error(err);
      });
  }, [router]);

  // Set the current privNode based on the current path
    const cd = () => {
      console.log('Paths: ', paths);
      const path = paths.join('/');
      setPath_Str(path);
      if (path in visitedNodes) {
        setPrivNode(visitedNodes[path]);
      } else {
        // TODO: Be able to handle the case where moving up a directory, and the parent is not in the visitedNodes
        //       This does not occure now, but would if we implement path based navigation
        // Get the next node -- pop the last path off the list
        const name = paths.pop();
        const link = dirLinks.find((link) => link.name === name);
        if (link) {
          const node = {
            name: link.name,
            //
            cid: link.cid,
            parentcid: privNode ? privNode.cid : rootCid,
            data: {},
          }
          setPrivNode(node);
          setVisitedNodes({
            ...visitedNodes,
            [path]: node,
          });
        }
      }
    }

  // Set the privLinks based on the current privNode
  useEffect(() => {
    if (privNode) {
      const [ parentLink, dirLinks, fileLinks ] = linksFromPrivNode(privNode);
      setParentLink(parentLink);
      setDirLinks(dirLinks);
      setFileLinks(fileLinks);
    }
  }, [privNode]);

  /* Handlers */

  // Initialize the privRef and root node
  const handleSetPrivRef = (ref: any) => {
    // TODO: Get the root node using the root CID + ref
    const node = defaultPrivNode;
    setPrivRef(ref);
    setPrivNode(node);
    setVisitedNodes({
      ...visitedNodes,
      ['']: node,
    });
  }

  // Handle Change Directory
  const handleCd = (name: string) => {
    console.log('Clicked on directory: ', name);
    // If the name is '..', then pop the last path off the list
    if (name === '..') {
      paths.pop();
    } else {
      paths.push(name);
    }
    setPaths(paths);
    cd();
  }

  /* Views */

  const LinkViewColumns = [
    {
      name: 'PrivNodeLink NAME',
      selector: (row: PrivNodeLink) => row.name,
      sortable: true,
      cell: (row: PrivNodeLink) => row.name,
    },
    {
      selector: (row: PrivNodeLink) => row.cid,
      sortable: true,
      cell: (row: PrivNodeLink) => row.cid,
    },
  ];

  const ExpandedComponentOverView = ({ data }: any) => (
    <div className="flex flex-row text-white">
      <button
        className="w-full bg-[#0398fc]"
        onClick={() => {
          handleCd(data.name);
        }}
      >
       CD 
      </button>
    </div>
  );

  return(
    <AuthorizedRoute>
      <>
            <div className="bg-white p-3 font-medium">
              <div className="text-slate-400">RootCid</div>
              <div className="text-xl mt-2">{rootCid}</div>
            </div>
            <div className="border-t-2 border-t-[#000] pb-44">
            <div className="flex mt-4">
            <Button
              ml={4}
              colorScheme="blue"
              variant="solid"
              onClick={() => router.push('/')}
            >
              <ArrowBackIcon />
              All Buckets
            </Button>
            { !privRef && (
                <Button
                  colorScheme="blue"
                  variant="solid"
                  onClick={() => {
                    handleSetPrivRef({});
                  }}
                >
                  Set Priv Ref
                </Button>  
            )}
            </div>
            </div>          
            { privRef && (
                <div className='relative'>
                <div className="bg-white p-3 font-medium">
                  <p> Path: {path_Str} </p>
                  <p> PrivNode: {privNode ? privNode.cid : 'null'} </p>
                  </div>
                 <div className="border-t-2 border-t-[#000] pb-44">
                  <p> Direcotry View </p>
                  <DataTable
                    columns={LinkViewColumns}
                    data={parentLink ? [parentLink, ...dirLinks] : dirLinks}
                    customStyles={customStyles}
                    expandableRows
                    expandableRowsComponent={ExpandedComponentOverView}
                  />

                </div>
                  <div className='absolute bottom-0 left-0'>
                  <p> File View </p>
                  <DataTable
                    columns={LinkViewColumns}
                    data={fileLinks}
                    customStyles={customStyles}
                  />
                  </div>
                </div>
              )
            }
          
        </>
    </AuthorizedRoute>
  )
}

export default FilesView;

FilesView.getLayout = function getLayout(page) {
  return <AuthedLayout>{page}</AuthedLayout>;
}
