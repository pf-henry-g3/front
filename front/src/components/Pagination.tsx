interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: PaginationProps) {
  // Función para generar los números de página visibles
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5; // Máximo de páginas visibles
    
    if (totalPages <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Si hay muchas páginas, mostrar páginas alrededor de la actual
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      // Ajustar si estamos cerca del final
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      // Agregar primera página y puntos suspensivos si es necesario
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }
      
      // Agregar páginas del rango
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Agregar puntos suspensivos y última página si es necesario
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between bg-linear-to-r from-white/90 to-white/80 backdrop-blur-sm px-3 py-2 border border-tur3/30 rounded-lg shadow-md">
      {/* Información de elementos - estilo landing */}
      <div className="text-xs text-oscuro2 mb-2 lg:mb-0 order-2 lg:order-1">
        <span className="bg-linear-to-r from-tur2/40 to-tur1/40 text-azul px-2 py-1 rounded-full font-medium shadow-sm backdrop-blur-sm border border-tur3/30 text-xs">
          {startItem}-{endItem} de {totalItems}
        </span>
      </div>

      {/* Controles de paginación - estilo landing */}
      <div className="flex items-center space-x-1 order-1 lg:order-2 mb-2 lg:mb-0">
        {/* Botón anterior - estilo landing */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold text-oscuro1 bg-white/90 backdrop-blur-sm border border-tur3/30 rounded-lg hover:bg-tur1/20 hover:border-tur1 hover:text-tur2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Números de página - estilo landing */}
        {visiblePages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
            disabled={typeof page !== 'number'}
            className={`inline-flex items-center justify-center w-7 h-7 text-xs font-semibold border rounded-lg transition-all duration-300 shadow-sm backdrop-blur-sm ${
              page === currentPage
                ? 'bg-linear-to-r from-tur1 to-tur2 border-tur1 text-azul shadow-md'
                : typeof page === 'number'
                ? 'bg-white/90 border-tur3/30 text-oscuro1 hover:bg-tur1/20 hover:border-tur1 hover:text-tur2 hover:shadow-md'
                : 'bg-white/60 border-tur3/20 text-oscuro3 cursor-default'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Botón siguiente - estilo landing */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold text-oscuro1 bg-white/90 backdrop-blur-sm border border-tur3/30 rounded-lg hover:bg-tur1/20 hover:border-tur1 hover:text-tur2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Selector de elementos por página - estilo landing */}
      <div className="flex items-center space-x-1 order-3">
        <label htmlFor="itemsPerPage" className="text-xs text-oscuro1 font-medium">
          Ver:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
          className="text-xs text-oscuro1 border border-tur3/30 rounded-lg px-2 py-1.5 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-tur1/30 focus:border-tur1 shadow-sm hover:shadow-md transition-all duration-300 min-w-12 font-medium"
        >
          <option value={3}>3</option>
          <option value={6}>6</option>
          <option value={9}>9</option>
          <option value={15}>15</option>
        </select>
      </div>
    </div>
  );
}