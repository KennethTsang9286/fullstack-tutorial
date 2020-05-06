import gql from 'graphql-tag';
import { GET_CART_ITEMS } from './pages/cart';
import * as LaunchTileTypes from './pages/__generated__/LaunchTile';
import { ApolloCache } from 'apollo-cache';
import * as GetCartItemTypes from './pages/__generated__/GetCartItems';
import { Resolvers } from 'apollo-client';

export const typeDefs = gql`
	extend type Query {
		isLoggedIn: Boolean!
		cartItems: [ID!]!
	}

	extend type Launch {
		isInCart: Boolean!
	}

	extend type Mutation {
		addOrRemoveFromCart(id: ID!): [ID!]!
	}

	extend type Mutation {
		changeStep(step: number!): number
	}
`;

type ResolverFn = (
	parent: any,
	args: any,
	{ cache }: { cache: ApolloCache<any> },
) => any;

interface ResolverMap {
	[field: string]: ResolverFn;
}

interface AppResolvers extends Resolvers {
	Launch: ResolverMap;
	Mutation: ResolverMap;
}

export const GET_STEP = gql`
	query GetStep {
		step @client
	}
`;

export const resolvers: AppResolvers = {
	Query: {
		step: (_, __, { cache }): number => {
			const { step } = cache.readQuery({
				query: GET_STEP,
			});
			return step;
		},
	},
	Launch: {
		isInCart: (
			launch: LaunchTileTypes.LaunchTile,
			_,
			{ cache },
		): boolean => {
			const queryResult = cache.readQuery<GetCartItemTypes.GetCartItems>({
				query: GET_CART_ITEMS,
			});
			// console.log({ queryResult });
			if (queryResult) {
				return queryResult.cartItems.includes(launch.id);
			}
			return false;
		},
	},
	Mutation: {
		addOrRemoveFromCart: (
			_,
			{ id }: { id: string },
			{ cache },
		): string[] => {
			const queryResult = cache.readQuery<GetCartItemTypes.GetCartItems>({
				query: GET_CART_ITEMS,
			});
			if (queryResult) {
				const { cartItems } = queryResult;
				const data = {
					cartItems: cartItems.includes(id)
						? cartItems.filter((i) => i !== id)
						: [...cartItems, id],
				};
				cache.writeQuery({ query: GET_CART_ITEMS, data });
				return data.cartItems;
			}
			return [];
		},
		changeStep: (_, { step }: { step: number }, { cache }): number => {
			cache.writeQuery({ query: GET_STEP, data: { step } });
			return step;
		},
	},
};
