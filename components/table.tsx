export function TH(props: { children?: JSX.Element | string, style?: string }) {
  return <th className={`uppercase  p-6 bg-gray-100 dark:bg-gray-200 border-gray-300 border border-collapse ${props.style ? props.style : "text-start"}`}>{props.children}</th>;
}

export function TD(props: { children?: JSX.Element | string, style?: string }) {
  return <td className={`whitespace-nowrap text-[#6a7a8c] hover:text-[#000000]  p-3 border-collapse border-gray-300 border ${props.style ? props.style : "text-start"}`
  }> {props.children}</td >;
}

export function THR(props: { children?: JSX.Element | string }) {
  return <tr className="whitespace-nowrap w-full bg-gray-100 dark:bg-gray-200 border-collapse border-gray-300 border">{props.children}</tr>;
}

export function TDR(props: { children?: JSX.Element | string }) {
  return (
    <tr className="bg-white odd:bg-gray-50 border-collapse border-gray-300 border hover:bg-gray-100 dark:hover:bg-gray-100">
      {props.children}
    </tr>
  );
}
