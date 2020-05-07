import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, Select } from './htmlTag';
import { DevTool } from 'react-hook-form-devtools';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

interface Props {
	formName: string;
	step: number;
	submit?: (data: any) => void;
}

const query = gql`
	query GET_FORM($id: String!) {
		getForm(id: $id) @client {
			id
			fields {
				name
				value
			}
		}
	}
`;

interface FormField {
	name: string;
	value: any;
}

const fieldsToDefaultValue = (fields?: [FormField]) => {
	if (!fields) {
		return [];
	}
	return fields.map(({ name, value }: FormField) => ({ [name]: value }));
};

const query2 = gql`
	query GetLaunch($id: Int!) {
		getLaunch(id: $id) @client {
			id
			isBooked
			rocket {
				id
				name
			}
		}
	}
`;

const Form: React.FC<Props> = ({ submit, formName, step }) => {
	const { data, error, loading } = useQuery(query, {
		variables: {
			id: formName,
		},
	});

	const { data: data2, error: error2 } = useQuery(query2, {
		variables: { id: 93 },
	});

	const { control, handleSubmit, setValue } = useForm({
		defaultValues: {
			HelloWorld: '',
			reactSelect: '',
		},
	});

	useEffect(() => {
		if (data && data.getForm) {
			setValue(fieldsToDefaultValue(data.getForm.fields));
		}
	}, [data]);

	const onSubmit = submit ? submit : (data: any) => console.log(data);
	// const onSubmit = (data: any) => console.log(data);

	return (
		<>
			{process.env.NODE_ENV !== 'production' && (
				<DevTool control={control} />
			)}
			<h1>
				Step {step} - {formName}
			</h1>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Controller as={Input} name="HelloWorld" control={control} />
				<Controller
					as={Select}
					name="reactSelect"
					control={control}
					onChange={([selected]) => {
						// console.log({ asd: selected.currentTarget.value });
						// React Select return object instead of value for selection
						return selected.currentTarget.value;
					}}
					children={
						<>
							<option value="volvo">Volvo</option>
							<option value="saab">Saab</option>
							<option value="mercedes">Mercedes</option>
							<option value="audi">Audi</option>
						</>
					}
				/>

				{/* <input type="submit" /> */}
				<button onClick={onSubmit}>asdads</button>
			</form>
		</>
	);
};
export default Form;
