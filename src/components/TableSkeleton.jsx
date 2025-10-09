const TableSkeleton = ({ rows = 5, columns = 6 }) => {
    return (
        <>
            {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                    {[...Array(columns)].map((_, colIndex) => (
                        <td key={colIndex}>
                            <div className="skeleton-loader"></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default TableSkeleton;
