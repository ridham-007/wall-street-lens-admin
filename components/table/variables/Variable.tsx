import { useEffect, useState } from "react";
import { TD, TDR, TH, THR } from "../../table";
import { Modal } from "@/components/model";
import Loader from "@/components/loader";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_VIEW_FOR_TERM, UPDATE_MAPPED_VALUE } from "@/utils/query";
import SummaryView from "./SummaryView";

export interface TableProps {
	termId: string;
	selectedTerm: any;
	year: string;
	quarter: string;
	setShowDelete: any;
	setShowEdit: any;
	setDeleteId: any;
	refetch: boolean;
	setEditId: any;
	setRefetch: any;
}

export interface Header {
	id: string;
	name: string;
	quarterWise: boolean;
}

export interface Row {
	title: string;
	cells: Cell[];
}

export interface Cell {
	id: string;
	value: string;
	year: number;
	quarter: number;
	groupKey: string;
	quarterId: string;
	termId: string;
	variableId: string;
}

export default function Variable({
	termId,
	refetch,
	selectedTerm,
	year,
	quarter,
	setShowDelete,
	setShowEdit,
	setDeleteId,
	setEditId,
	setRefetch
}: TableProps) {
	const [getTermView, { data: termView, refetch: refetchTermView }] =
		useLazyQuery(GET_VIEW_FOR_TERM, {
			fetchPolicy: "network-only",
			variables: {
				termId: termId,
				...((selectedTerm?.quarterWiseTable || selectedTerm?.summaryOnly) && {
					quarter: Number(quarter),
					year: Number(year),
				}),
			},
		});

	useEffect(() => {
		getTermView();
	}, [termId]);

	useEffect(() => {
		if (refetch) {
			refetchTermView();
			setRefetch(false);
		}
	}, [year, quarter, refetch]);

	const [show, setShow] = useState(false);
	const [cellData, setCellData] = useState({});
	const [showLoader, setShowLoader] = useState(false);

	const [updateValue] = useMutation(UPDATE_MAPPED_VALUE);
	const { headers = [], rows = [] }: { headers: Header[]; rows: Row[] } =
		termView?.getViewForTerm || {};

	const checkValidId = (id: string) => {
		return !!id && !id.startsWith("Dummy");
	};
	const onSave = async (
		id: string,
		value: string,
		groupKey: string,
		quarterId: string,
		termId: string,
		variableId: string
	) => {
		setShowLoader(true);
		await updateValue({
			variables: {
				mappingInfo: {
					...(checkValidId(id) && { id }),
					value: value,
					groupKey: groupKey,
				},
				...(!checkValidId(id) && {
					quarterId: quarterId,
					termId: termId,
					variableId: variableId,
				}),
			},
		});
		setShowLoader(false);
		setShow(false);
		refetchTermView();
	};

	useEffect(() => {
		getTermView();
	}, []);

	const handleShowDelete = (identifier: any) => {
		setShowDelete(true);
		setDeleteId(identifier);
	};

	const handleShowEdit = (current: any) => {
		const nameParts = current.name?.split('-'); // Splitting the name into parts

		const year = parseInt(nameParts[1]); // Extracting the year (as a number)
		const quarter = parseInt(nameParts[0].substring(1)); // Extracting the quarter (as a number)

		const result = {
			id: current.id,
			year: year,
			quarter: quarter,
			highlightColor: current.highlightColor,
		}
		setShowEdit(true);
		setEditId(result);

	};

	const selectedColumn = headers[cellData?.columnIndex];

	return (
		<>
			{showLoader && <Loader />}
			<div
				style={{
					maxHeight: "calc(100vh - 200px)",
				}}
				className="w-[calc((w-screen)- (w-1/5)) overflow-scroll"
			>
				{!selectedTerm?.summaryOnly && (
					<table className="app-table w-full">
						<thead className="w-full sticky top-0 z-20">
							<THR>
								<>
									{!selectedTerm?.quarterWiseTable ? (
										<TH>KPI Variable</TH>
									) : (
										<TH>Year</TH>
									)}
									{headers?.map((current: any) => {
										return (
											<TH key={current.id}>
												<div className="flex">
													{current.name}
													{!selectedTerm?.quarterWiseTable && (
														<span
															className="px-2 cursor-pointer"
															onClick={() => {
																handleShowDelete(current.id);
															}}
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 48 48"
																width="24px"
																height="24px"
															>
																<path d="M 24 4 C 20.491685 4 17.570396 6.6214322 17.080078 10 L 10.238281 10 A 1.50015 1.50015 0 0 0 9.9804688 9.9785156 A 1.50015 1.50015 0 0 0 9.7578125 10 L 6.5 10 A 1.50015 1.50015 0 1 0 6.5 13 L 8.6386719 13 L 11.15625 39.029297 C 11.427329 41.835926 13.811782 44 16.630859 44 L 31.367188 44 C 34.186411 44 36.570826 41.836168 36.841797 39.029297 L 39.361328 13 L 41.5 13 A 1.50015 1.50015 0 1 0 41.5 10 L 38.244141 10 A 1.50015 1.50015 0 0 0 37.763672 10 L 30.919922 10 C 30.429604 6.6214322 27.508315 4 24 4 z M 24 7 C 25.879156 7 27.420767 8.2681608 27.861328 10 L 20.138672 10 C 20.579233 8.2681608 22.120844 7 24 7 z M 11.650391 13 L 36.347656 13 L 33.855469 38.740234 C 33.730439 40.035363 32.667963 41 31.367188 41 L 16.630859 41 C 15.331937 41 14.267499 40.033606 14.142578 38.740234 L 11.650391 13 z M 20.476562 17.978516 A 1.50015 1.50015 0 0 0 19 19.5 L 19 34.5 A 1.50015 1.50015 0 1 0 22 34.5 L 22 19.5 A 1.50015 1.50015 0 0 0 20.476562 17.978516 z M 27.476562 17.978516 A 1.50015 1.50015 0 0 0 26 19.5 L 26 34.5 A 1.50015 1.50015 0 1 0 29 34.5 L 29 19.5 A 1.50015 1.50015 0 0 0 27.476562 17.978516 z" />
															</svg>
														</span>
													)}{!selectedTerm?.quarterWiseTable && (
														<span
															className="px-2 cursor-pointer"
															onClick={() => {
																handleShowEdit(current);
															}}
														>
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="24px" height="24px"><path d="M 23.90625 3.96875 C 22.859375 3.96875 21.8125 4.375 21 5.1875 L 5.1875 21 L 5.125 21.3125 L 4.03125 26.8125 L 3.71875 28.28125 L 5.1875 27.96875 L 10.6875 26.875 L 11 26.8125 L 26.8125 11 C 28.4375 9.375 28.4375 6.8125 26.8125 5.1875 C 26 4.375 24.953125 3.96875 23.90625 3.96875 Z M 23.90625 5.875 C 24.410156 5.875 24.917969 6.105469 25.40625 6.59375 C 26.378906 7.566406 26.378906 8.621094 25.40625 9.59375 L 24.6875 10.28125 L 21.71875 7.3125 L 22.40625 6.59375 C 22.894531 6.105469 23.402344 5.875 23.90625 5.875 Z M 20.3125 8.71875 L 23.28125 11.6875 L 11.1875 23.78125 C 10.53125 22.5 9.5 21.46875 8.21875 20.8125 Z M 6.9375 22.4375 C 8.136719 22.921875 9.078125 23.863281 9.5625 25.0625 L 6.28125 25.71875 Z" /></svg>
														</span>
													)}
												</div>
											</TH>
										);
									})}
								</>
							</THR>
						</thead>
						<tbody className="w-full">
							{rows.map((current, index) => {
								return (
									<TDR key={index}>
										<>
											{!selectedTerm?.quarterWiseTable ? (
												<TD>{current.title ?? ""}</TD>
											) : (
												<TD>{year}</TD>
											)}

											{current.cells.map((cur, index) => {
												const selectedColumn = headers[index];
												return (
													<TD
														style="cursor-pointer"
														onClick={() => {
															setShow(true);
															setCellData({
																id: cur.id,
																value: cur.value,
																title: current.title,
																year: cur.year,
																quarter: cur.quarter,
																groupKey: cur.groupKey,
																quarterId: cur.quarterId,
																termId: cur.termId,
																variableId: cur.variableId,
																columnIndex: index,
															});
														}}
														key={cur.id}
													>
														<>
															{selectedColumn?.name !== "VisibleToChart" &&
																cur?.value}
															{cur.value === "true" &&
																selectedColumn?.name === "VisibleToChart" && (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		data-name="Layer 1"
																		viewBox="0 0 99 123.75"
																		x="0px"
																		y="0px"
																		className="w-7 h-7"
																	>
																		<path d="M72.69,40,46.44,66.31a2.62,2.62,0,0,1-3.65,0L26.3,49.82a2.6,2.6,0,0,1,0-3.65L30,42.44a2.65,2.65,0,0,1,3.63,0l10.94,11L65.33,32.67a2.65,2.65,0,0,1,3.63,0l3.73,3.75A2.55,2.55,0,0,1,72.69,40Z" />
																	</svg>
																)}

															{cur.value === "false" &&
																selectedColumn?.name === "VisibleToChart" && (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		data-name="Layer 1"
																		viewBox="0 0 99 123.75"
																		x="0px"
																		y="0px"
																		className="w-7 h-7"
																	>
																		<path d="M70.25,62.65a2.66,2.66,0,0,1,0,3.76L66.4,70.26a2.64,2.64,0,0,1-3.75,0L49.49,57.1,36.34,70.26a2.73,2.73,0,0,1-3.75,0l-3.87-3.85a2.71,2.71,0,0,1,0-3.76L41.89,49.5,28.73,36.35a2.71,2.71,0,0,1,0-3.76l3.87-3.85A2.65,2.65,0,0,1,34.47,28a2.68,2.68,0,0,1,1.87.78L49.49,41.9,62.65,28.74a2.73,2.73,0,0,1,3.75,0l3.85,3.85a2.66,2.66,0,0,1,0,3.76L57.09,49.5Z" />
																	</svg>
																)}
														</>
													</TD>
												);
											})}
										</>
									</TDR>
								);
							})}
						</tbody>
					</table>
				)}
				{selectedTerm?.summaryOnly && (
					<div className="border-solid rounded-xl border-2 p-[16px]">
						{(headers ?? []).map((header, index) => {
							const currCell = rows[0]?.cells[index];
							return (
								<div
									className="flex flex-col border-solid rounded-sm"
									key={index}
								>
									<div className="text-[18px] font-medium my-[16px]">
										{header.name}
									</div>
									<SummaryView
										key={currCell?.id}
										contentString={currCell?.value ?? ""}
										onClick={() => {
											setShow(true);
											setCellData({
												id: currCell.id,
												value: currCell.value,
												title: rows[0]?.title,
												year: currCell.year,
												quarter: currCell.quarter,
												groupKey: currCell.groupKey,
												quarterId: currCell.quarterId,
												termId: currCell.termId,
												variableId: currCell.variableId,
											});
										}}
									/>
								</div>
							);
						})}
					</div>
				)}
				{show && (
					<AddUpdateParaMeter
						onClose={() => setShow(false)}
						onSave={onSave}
						cellData={cellData}
						selectedColumn={selectedColumn}
					/>
				)}
			</div>
		</>
	);
}

interface AddUpdateParameterProps {
	onSave?: any;
	onClose?: any;
	cellData?: any;
	selectedColumn?: any;
}

function AddUpdateParaMeter(props: AddUpdateParameterProps) {
	const [val, setVal] = useState<string>(props.cellData?.value.toString());
	const handleOnSave = async () => {
		if (!!props.onSave) {
			props.onSave(
				props.cellData.id,
				val,
				props.cellData.groupKey,
				props?.cellData?.quarterId,
				props?.cellData?.termId,
				props?.cellData?.variableId
			);
		}
	};

	const handleOnChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
		const value =
			e.target.type === "checkbox" ? e.target.checked?.toString() : e.target.value;
		setVal(value);
	};

	return (
		<Modal
			showModal={true}
			handleOnSave={handleOnSave}
			title={props.cellData?.title}
			onClose={() => props.onClose && props.onClose()}
		>
			<>
				<form className="form w-100">
					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-[20px]">
							<label
								htmlFor="title"
								className="text-lg font-bold text-gray-700"
							>
								Year:
							</label>
							<div>{props.cellData?.year}</div>
						</div>
						<div className="flex items-center gap-[20px]">
							<label
								htmlFor="title"
								className="text-lg font-bold text-gray-700"
							>
								Quarter:
							</label>
							<div>{props.cellData?.quarter}</div>
						</div>
					</div>
					<div className="flex items-center gap-[20px] mt-[20px]">
						<label htmlFor="value" className="text-lg font-bold text-gray-700">
							Value:
						</label>
						{props.selectedColumn?.name === "VisibleToChart" && (
							<div>
								<input
									type="checkbox"
									checked={val === "true"}
									onChange={handleOnChange}
									className="form-checkbox h-4 w-4 text-blue-600"
								/>
							</div>
						)}
						{val.length < 30 &&
							props.selectedColumn?.name !== "VisibleToChart" && (
								<input
									type="text"
									id="value"
									name="value"
									value={val}
									onChange={handleOnChange}
									required
									className="w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
								/>
							)}
						{val.length >= 31 && (
							<textarea
								id="value"
								name="value"
								value={val}
								onChange={handleOnChange}
								required
								className="w-[calc(50vw)] mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
							/>
						)}
					</div>
				</form>
			</>
		</Modal>
	);
}
