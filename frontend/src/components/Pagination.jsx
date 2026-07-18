import "../styles/Pagination.css";

export default function Pagination({

    previousOffset,

    nextOffset,

    onPageChange,

}) {

    return (

        <div className="pagination">

            <button

                disabled={previousOffset === null}

                onClick={() =>
                    onPageChange(previousOffset)
                }

            >

                Previous

            </button>

            <button

                disabled={nextOffset === null}

                onClick={() =>
                    onPageChange(nextOffset)
                }

            >

                Next

            </button>

        </div>

    );

}