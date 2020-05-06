import React, { Fragment } from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import { LaunchTile, Header, Button, Loading } from '../components';
import { RouteComponentProps } from '@reach/router';
import * as GetLaunchListTypes from './__generated__/GetLaunchList';
import { GET_STEP } from '../resolvers';
export const LAUNCH_TILE_data1 = gql`
	fragment LaunchTile on Launch {
		__typename
		id
		isBooked
		rocket {
			id
			name
		}
		mission {
			name
			missionPatch
		}
	}
`;

export const GET_LAUNCHES = gql`
	query GetLaunchList($after: String) {
		launches(after: $after) {
			cursor
			hasMore
			launches {
				...LaunchTile
			}
		}
	}
	${LAUNCH_TILE_data1}
`;

interface LaunchesProps extends RouteComponentProps {}

const Launches: React.FC<LaunchesProps> = () => {
	const { data: data1, loading, error, fetchMore } = useQuery<
		GetLaunchListTypes.GetLaunchList,
		GetLaunchListTypes.GetLaunchListVariables
	>(GET_LAUNCHES);

	const {
		data: data2,
		loading: loading2,
		error: error2,
		fetchMore: fetchMore2,
	} = useQuery(GET_STEP);

	if (loading) return <Loading />;
	if (error || !data1) return <p>ERROR</p>;

	return (
		<Fragment>
			<Header />

			{data2 && <p>{data2.step}</p>}
			{data1.launches &&
				data1.launches.launches &&
				data1.launches.launches.map((launch: any) => (
					<LaunchTile key={launch.id} launch={launch} />
				))}

			{data1.launches && data1.launches.hasMore && (
				<Button
					onClick={() =>
						fetchMore({
							variables: {
								after: data1.launches.cursor,
							},
							updateQuery: (
								prev,
								{ fetchMoreResult, ...rest },
							) => {
								if (!fetchMoreResult) return prev;
								return {
									...fetchMoreResult,
									launches: {
										...fetchMoreResult.launches,
										launches: [
											...prev.launches.launches,
											...fetchMoreResult.launches
												.launches,
										],
									},
								};
							},
						})
					}
				>
					Load More
				</Button>
			)}
		</Fragment>
	);
};

export default Launches;
