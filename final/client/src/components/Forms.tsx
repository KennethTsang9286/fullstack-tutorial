import React from 'react';
import Form1 from './Form1';
import Form2 from './Form2';
import Form3 from './Form3';
// import { GET_STEP } from '../resolvers';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const GET_STEP = gql`
	query GetStep {
		step @client
	}
`;

const SET_STEP = gql`
	mutation SetStep($step: Int!) {
		changeStep(step: $step) @client
	}
`;

const GET_FORM = gql`
	query {
		forms @client {
			id
			fields {
				name
				value
			}
		}
	}
`;

const Forms = () => {
	const formName = 'form1';

	const { data, loading: stepLoading, error: stepError } = useQuery(GET_STEP);
	const { data: formsData, error: formsError } = useQuery(GET_FORM);
	const step = data?.step || 0;

	const [mutation, { loading, error }] = useMutation(SET_STEP, {
		variables: { step: step + 1 },
		refetchQueries: [
			{
				query: GET_STEP,
			},
		],
	});

	const submit = step < 3 ? () => mutation() : undefined;
	const content = () => {
		switch (step) {
			case 2:
				return <Form2 formName="Form2" step={step} submit={submit} />;
			case 3:
				return <Form3 formName="Form3" step={step} submit={submit} />;
			case 1:
			default:
				return <Form1 formName="Form1" step={step} submit={submit} />;
		}
	};

	return (
		<div>
			{content()}
			{formsData && formsData.forms && (
				<p>{JSON.stringify(formsData.forms)}</p>
			)}
		</div>
	);
};

export default Forms;
