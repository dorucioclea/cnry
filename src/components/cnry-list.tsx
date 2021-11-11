import * as React from 'react';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { ChainID } from 'micro-stacks/common';
import { networkAtom, userStxAddressesAtom } from '@micro-stacks/react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Skeleton from '@mui/material/Skeleton';
import { cnryUserPendingTxIdsAtom } from '@store/cnry';
import { cnryTokenIdsAtom, cnryUserTokenIdsAtom, cnryUserWatcherTokenIdsAtom } from '@store/cnry';
import cnryListTabStateAtom from '@store/cnry-list-tab-state';
import { PendingCnryCardFromTxId, CnryCardFromTxId } from '@components/cnry-card';
import CnryCard from '@components/cnry-card';
import HatchCnryForm from '@components/hatch-cnry-form';
import SafeSuspense from '@components/safe-suspense';
import { t } from '@lingui/macro';

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
};

const CnryList = () => {
  const [network] = useAtom(networkAtom);
  const chain = network?.chainId === ChainID.Mainnet ? 'mainnet' : 'testnet';
  const [userStxAddresses] = useAtom(userStxAddressesAtom);
  const userStxAddress = userStxAddresses?.[chain] || '';
  const [userPendingTxids] = useAtom(cnryUserPendingTxIdsAtom);
  const [cnryAllTokenIds] = useAtom(cnryTokenIdsAtom);
  const [cnryUserTokenIds] = useAtom(cnryUserTokenIdsAtom(userStxAddress));
  const [watcherUserTokenIds] = useAtom(cnryUserWatcherTokenIdsAtom(userStxAddress));
  const [value, setValue] = useAtom(cnryListTabStateAtom);
  const userHasCnrys =
    cnryUserTokenIds === undefined || cnryUserTokenIds.length == 0 ? false : true;
  const userHasWatching =
    watcherUserTokenIds === undefined || watcherUserTokenIds.length == 0 ? false : true;

  useEffect(() => {
    userHasCnrys !== undefined && setValue('two');
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const userPendingHatchesList = () => (
    <Box component="div" sx={{ width: 250 }} role="presentation">
      <List
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        //subheader={<ListSubheader>{t`Transactions`}</ListSubheader>}
      >
        {userPendingTxids.map(txid => (
          <PendingCnryCardFromTxId key={txid} txid={txid} />
        ))}
      </List>
    </Box>
  );
  const verticalUserWatcherCnrysList = () => (
    <ImageList
      sx={{
        gridAutoFlow: 'column',
        gridTemplateColumns: 'repeat(auto-fit, minmax(292px,1fr)) !important',
        gridAutoColumns: 'minmax(292px, 1fr)',
      }}
    >
      <Stack component="div" direction="row" spacing={2}>
        {watcherUserTokenIds.map(tokenId => (
          <ImageListItem key={tokenId}>
            <CnryCard key={tokenId} tokenId={tokenId} />
          </ImageListItem>
        ))}
      </Stack>
    </ImageList>
  );

  const horizontalUserPendingCnrysList = () => (
    <ImageList
      sx={{
        gridAutoFlow: 'column',
        gridTemplateColumns: 'repeat(auto-fit, minmax(292px,1fr)) !important',
        gridAutoColumns: 'minmax(292px, 1fr)',
      }}
    >
      <Stack component="div" direction="row" spacing={2}>
        {userPendingTxids.map(txid => (
          <ImageListItem key={txid}>
            <PendingCnryCardFromTxId key={txid} txid={txid} />
          </ImageListItem>
        ))}
      </Stack>
    </ImageList>
  );
  const verticalAllCnrysList = () => (
    <ImageList cols={2} sx={{ mt: 0 }}>
      {cnryAllTokenIds.map(txid => (
        <ImageListItem sx={{ width: '100%', m: 'auto' }} key={txid}>
          <CnryCardFromTxId key={txid} txid={txid} />
        </ImageListItem>
      ))}
      {/* </Stack> */}
    </ImageList>
  );

  const verticalUserCnrysList = () => (
    <ImageList cols={2} sx={{ mt: 0 }}>
      {/* <Stack  sx={{justifyContent: 'center'}} component="div" direction="column" spacing={2}> */}
      {cnryUserTokenIds.map(txid => (
        <ImageListItem sx={{ width: '100%', m: 'auto' }} key={txid}>
          <CnryCardFromTxId key={txid} txid={txid} />
        </ImageListItem>
      ))}
      {/* </Stack> */}
    </ImageList>
  );

  return (
    <div>
      <Tabs value={value} onChange={handleChange} centered>
        <Tab value="one" label="New" />
        <Tab value="two" label="My Cnrys" disabled={userHasCnrys ? false : true} />
        <Tab value="three" label="Watching" disabled={userHasWatching ? false : true} />
        <Tab value="four" label="Browse" />
      </Tabs>
      <TabPanel value={value} index="one">
        <SafeSuspense
          fallback={
            <>
              <Skeleton sx={{ m: 'auto' }} variant="rectangular" width={400} height={200} />
            </>
          }
        >
          <HatchCnryForm />
          <Stack maxWidth="sm" sx={{ m: 'auto' }}>
            <SafeSuspense fallback={<CircularProgress />}>
              {horizontalUserPendingCnrysList()}
            </SafeSuspense>
          </Stack>
        </SafeSuspense>
      </TabPanel>
      <TabPanel value={value} index="two">
        <Stack maxWidth="sm" sx={{ m: 'auto' }}>
          <SafeSuspense fallback={<CircularProgress />}>{verticalUserCnrysList()}</SafeSuspense>
        </Stack>
      </TabPanel>
      <TabPanel value={value} index="three">
        <Stack maxWidth="sm" sx={{ m: 'auto' }}>
          <SafeSuspense fallback={<CircularProgress />}>
            {verticalUserWatcherCnrysList()}
          </SafeSuspense>
        </Stack>
      </TabPanel>
      <TabPanel value={value} index="four">
        <Stack maxWidth="sm" sx={{ m: 'auto' }}>
          <SafeSuspense fallback={<CircularProgress />}>{verticalAllCnrysList()}</SafeSuspense>{' '}
        </Stack>
      </TabPanel>
    </div>
  );
};
export default CnryList;
