export interface TableProps {
    contentString: string;
    onClick?: any;
}

export default function SummaryView(props: TableProps){
    const {
        contentString,
    } = props;

    const chunks = contentString.split(/(<Table>.*?<\/Table>)/gs).filter(chunk => {
        return chunk.trim() !== ''
    });
    const elements: React.ReactNode[] = [];
    chunks.forEach((chunk, index) => {
        if (chunk.startsWith('<Table>')) {
            const tableContent = chunk.replace('<Table>', '').replace('</Table>', '').split(';').map(cell => cell.trim());
            const result = tableContent.map(str => {
                const [header, ...dataCells] = str.split('->');
                return { header, dataCells };
            });
            elements.push(
                <div className='border-b-[1px] py-[16px]'>
                    <table key={index} className="border table sm:hidden border-collapse">
                        <thead>
                            <tr>
                                {result.map((cell, cellIndex) => (
                                    <th key={cellIndex} className="border p-2">{cell.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((cur, index) => {
                                return (
                                    <tr key={`row-${index}`}>
                                        {cur.dataCells.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="border p-2">{cell}</td>
                                        ))}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <table className="border hidden sm:table border-collapse">
                        <tbody>
                            {result.map((cur, index) => (
                                <tr key={`row-${index}`} className="border">
                                    <th className="border p-2">{cur.header}</th>
                                    {cur.dataCells.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="border p-2">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>

            );
        } else {
            elements.push(<p key={index}>{chunk.trim()}</p>);
        }
    });

    return <div onClick={props.onClick} className='cursor-pointer'>{elements}</div>;
};
