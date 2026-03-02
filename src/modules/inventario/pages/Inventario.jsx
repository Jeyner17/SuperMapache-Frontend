import { useState, useEffect } from 'react';
import { useNotification } from '../../../shared/hooks/useNotification';
import inventarioService from '../services/inventario.service';
import categoriaService from '../../categorias/services/categoria.service';
import Button from '../../../shared/components/UI/Button';
import Card from '../../../shared/components/UI/Card';
import Modal from '../../../shared/components/UI/Modal';
import Badge from '../../../shared/components/UI/Badge';
import Loading from '../../../shared/components/UI/Loading';
import {
    Plus,
    Search,
    Package,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Eye,
    Edit2,
    History,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import FormularioLote from '../components/FormularioLote';
import FormularioAjuste from '../components/FormularioAjuste';
import DetallesLote from '../components/DetallesLote';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

const Inventario = () => {
    const { showSuccess, showError } = useNotification();
    const [vista, setVista] = useState('resumen'); // 'resumen' | 'lotes' | 'alertas'
    const [resumen, setResumen] = useState([]);
    const [lotes, setLotes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // 'crear' | 'ajustar' | 'detalle'
    const [selectedLote, setSelectedLote] = useState(null);
    const [alertas, setAlertas] = useState(null);

    useEffect(() => {
        cargarCategorias();
        cargarDatos();
    }, [vista, filtroCategoria, searchTerm, filtroEstado]);

    const cargarCategorias = async () => {
        try {
            const response = await categoriaService.getAll();
            setCategorias(response.data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    const cargarDatos = async () => {
        try {
            setLoading(true);

            if (vista === 'resumen') {
                const response = await inventarioService.getResumen({
                    categoria_id: filtroCategoria,
                    search: searchTerm
                });
                setResumen(response.data);
            } else if (vista === 'lotes') {
                const response = await inventarioService.getLotes({
                    categoria_id: filtroCategoria,
                    search: searchTerm,
                    estado: filtroEstado
                });
                setLotes(response.data);
            } else if (vista === 'alertas') {
                const response = await inventarioService.getAlertas();
                setAlertas(response.data);
            }
        } catch (error) {
            showError(error.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleCrearLote = () => {
        setModalType('crear');
        setSelectedLote(null);
        setModalOpen(true);
    };

    const handleAjustarStock = (lote) => {
        setModalType('ajustar');
        setSelectedLote(lote);
        setModalOpen(true);
    };

    const handleVerDetalle = (lote) => {
        setModalType('detalle');
        setSelectedLote(lote);
        setModalOpen(true);
    };

    const handleSubmitLote = async (data) => {
        try {
            await inventarioService.crearLote(data);
            showSuccess('Lote creado exitosamente');
            setModalOpen(false);
            cargarDatos();
        } catch (error) {
            showError(error.message || 'Error al crear lote');
        }
    };

    const handleSubmitAjuste = async (data) => {
        try {
            await inventarioService.ajustarStock(selectedLote.id, data);
            showSuccess('Stock ajustado exitosamente');
            setModalOpen(false);
            cargarDatos();
        } catch (error) {
            showError(error.message || 'Error al ajustar stock');
        }
    };

    const handleVerificarEstados = async () => {
        try {
            const response = await inventarioService.verificarEstados();
            showSuccess(`${response.data.length} lotes actualizados`);
            cargarDatos();
        } catch (error) {
            showError('Error al verificar estados');
        }
    };

    // Calcular estadísticas
    const stats = {
        total_productos: resumen.length,
        stock_bajo: resumen.filter(p => p.estado_stock === 'bajo').length,
        agotados: resumen.filter(p => p.estado_stock === 'agotado').length,
        valor_total: resumen.reduce((sum, p) => sum + (p.stock_actual * p.precio_venta), 0)
    };

    if (loading && resumen.length === 0 && lotes.length === 0) {
        return <Loading message="Cargando inventario..." />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Inventario
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Control de stock con lotes y fechas de caducidad
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button onClick={handleVerificarEstados} variant="secondary">
                        <RefreshCw size={20} />
                        Verificar Estados
                    </Button>
                    <Button onClick={handleCrearLote} size="lg">
                        <Plus size={20} />
                        Nuevo Lote
                    </Button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Productos</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                {stats.total_productos}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Stock Bajo</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {stats.stock_bajo}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Agotados</p>
                            <p className="text-2xl font-bold text-red-600">
                                {stats.agotados}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(stats.valor_total)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Pestañas */}
            <Card className="p-1">
                <div className="flex gap-1">
                    <button
                        onClick={() => setVista('resumen')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${vista === 'resumen'
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover'
                            }`}
                    >
                        <Package className="inline-block w-4 h-4 mr-2" />
                        Resumen por Producto
                    </button>
                    <button
                        onClick={() => setVista('lotes')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${vista === 'lotes'
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover'
                            }`}
                    >
                        <History className="inline-block w-4 h-4 mr-2" />
                        Lotes Detallados
                    </button>
                    <button
                        onClick={() => setVista('alertas')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${vista === 'alertas'
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover'
                            }`}
                    >
                        <AlertTriangle className="inline-block w-4 h-4 mr-2" />
                        Alertas
                    </button>
                </div>
            </Card>

            {/* Filtros */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <select
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>

                    {vista === 'lotes' && (
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Todos los estados</option>
                            <option value="disponible">Disponible</option>
                            <option value="por_vencer">Por Vencer</option>
                            <option value="vencido">Vencido</option>
                            <option value="agotado">Agotado</option>
                        </select>
                    )}
                </div>
            </Card>

            {/* Contenido según la vista */}
            {vista === 'resumen' && (
                <VistaResumen
                    resumen={resumen}
                    loading={loading}
                    onAjustar={handleAjustarStock}
                />
            )}

            {vista === 'lotes' && (
                <VistaLotes
                    lotes={lotes}
                    loading={loading}
                    onVerDetalle={handleVerDetalle}
                    onAjustar={handleAjustarStock}
                />
            )}

            {vista === 'alertas' && (
                <VistaAlertas
                    alertas={alertas}
                    loading={loading}
                    onVerDetalle={handleVerDetalle}
                />
            )}

            {/* Modales */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={
                    modalType === 'crear' ? 'Nuevo Lote de Inventario' :
                        modalType === 'ajustar' ? 'Ajustar Stock' :
                            'Detalles del Lote'
                }
                size={modalType === 'detalle' ? 'lg' : 'md'}
            >
                {modalType === 'crear' && (
                    <FormularioLote
                        onSubmit={handleSubmitLote}
                        onCancel={() => setModalOpen(false)}
                    />
                )}
                {modalType === 'ajustar' && (
                    <FormularioAjuste
                        lote={selectedLote}
                        onSubmit={handleSubmitAjuste}
                        onCancel={() => setModalOpen(false)}
                    />
                )}
                {modalType === 'detalle' && selectedLote && (
                    <DetallesLote
                        lote={selectedLote}
                        onClose={() => setModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
};

// Vista Resumen por Producto
const VistaResumen = ({ resumen, loading, onAjustar }) => {
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (resumen.length === 0) {
        return (
            <Card className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    No hay productos en inventario
                </h3>
            </Card>
        );
    }

    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-dark-hover">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Producto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Categoría
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Stock Actual
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Stock Mín/Máx
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Lotes
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Valor
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                        {resumen.map((producto) => (
                            <tr key={producto.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {producto.nombre}
                                        </div>
                                        {producto.codigo_barras && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {producto.codigo_barras}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant="primary">
                                        {producto.categoria?.nombre}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {producto.stock_actual}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                        {producto.unidad_medida}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                                    {producto.stock_minimo} / {producto.stock_maximo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <Badge variant="info">
                                        {producto.cantidad_lotes}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <EstadoStockBadge
                                        estado={producto.estado_stock}
                                        porVencer={producto.tiene_lotes_por_vencer}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(producto.stock_actual * producto.precio_venta)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// Vista Lotes Detallados
const VistaLotes = ({ lotes, loading, onVerDetalle, onAjustar }) => {
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (lotes.length === 0) {
        return (
            <Card className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    No hay lotes registrados
                </h3>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotes.map((lote) => (
                <Card key={lote.id} className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                                {lote.producto.nombre}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Lote: {lote.numero_lote}
                            </p>
                        </div>
                        <EstadoLoteBadge estado={lote.estado} />
                    </div>

                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Stock Actual:</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {lote.cantidad_actual} {lote.producto.unidad_medida}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Stock Inicial:</span>
                            <span className="text-gray-700 dark:text-gray-300">
                                {lote.cantidad_inicial}
                            </span>
                        </div>

                        {lote.fecha_caducidad && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Caducidad:</span>
                                <span className={`font-medium ${lote.estado === 'vencido' ? 'text-red-600' :
                                        lote.estado === 'por_vencer' ? 'text-orange-600' :
                                            'text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {formatDate(lote.fecha_caducidad)}
                                </span>
                            </div>
                        )}

                        {lote.ubicacion && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Ubicación:</span>
                                <span className="text-gray-700 dark:text-gray-300">
                                    {lote.ubicacion}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onVerDetalle(lote)}
                            className="flex-1 py-2 px-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400"
                        >
                            <Eye size={16} />
                            <span className="text-sm">Ver</span>
                        </button>
                        <button
                            onClick={() => onAjustar(lote)}
                            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                            <Edit2 size={16} />
                            <span className="text-sm">Ajustar</span>
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    );
};

// Vista Alertas
const VistaAlertas = ({ alertas, loading, onVerDetalle }) => {
    if (loading || !alertas) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const totalAlertas =
        alertas.stock_bajo.length +
        alertas.por_vencer.length +
        alertas.vencidos.length +
        alertas.agotados.length;

    if (totalAlertas === 0) {
        return (
            <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    ¡Todo en orden!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    No hay alertas de inventario en este momento
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Productos Vencidos */}
            {alertas.vencidos.length > 0 && (
                <Card className="p-6 border-l-4 border-red-500">
                    <div className="flex items-center gap-3 mb-4">
                        <XCircle className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Productos Vencidos ({alertas.vencidos.length})
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {alertas.vencidos.map((lote) => (
                            <AlertaItem
                                key={lote.id}
                                lote={lote}
                                tipo="vencido"
                                onVerDetalle={onVerDetalle}
                            />
                        ))}
                    </div>
                </Card>
            )}

            {/* Productos Por Vencer */}
            {alertas.por_vencer.length > 0 && (
                <Card className="p-6 border-l-4 border-orange-500">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-6 h-6 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Productos Próximos a Vencer ({alertas.por_vencer.length})
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {alertas.por_vencer.map((lote) => (
                            <AlertaItem
                                key={lote.id}
                                lote={lote}
                                tipo="por_vencer"
                                onVerDetalle={onVerDetalle}
                            />
                        ))}
                    </div>
                </Card>
            )}

            {/* Stock Bajo */}
            {alertas.stock_bajo.length > 0 && (
                <Card className="p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingDown className="w-6 h-6 text-yellow-600" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Stock Bajo ({alertas.stock_bajo.length})
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {alertas.stock_bajo.map((producto) => (
                            <div
                                key={producto.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-hover rounded-lg"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800 dark:text-white">
                                        {producto.nombre}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Stock actual: {producto.stock_actual} / Mínimo: {producto.stock_minimo}
                                    </p>
                                </div>
                                <Badge variant="warning">Stock Bajo</Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Productos Agotados */}
            {alertas.agotados.length > 0 && (
                <Card className="p-6 border-l-4 border-gray-500">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Productos Agotados ({alertas.agotados.length})
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {alertas.agotados.map((producto) => (
                            <div
                                key={producto.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-hover rounded-lg"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800 dark:text-white">
                                        {producto.nombre}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Sin stock disponible
                                    </p>
                                </div>
                                <Badge variant="danger">Agotado</Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

// Componente AlertaItem
const AlertaItem = ({ lote, tipo, onVerDetalle }) => {
    const diasParaVencer = lote.fecha_caducidad
        ? Math.ceil((new Date(lote.fecha_caducidad) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
            <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">
                    {lote.producto.nombre}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lote: {lote.numero_lote} • Stock: {lote.cantidad_actual}
                </p>
                {lote.fecha_caducidad && (
                    <p className={`text-sm font-medium ${tipo === 'vencido' ? 'text-red-600' : 'text-orange-600'
                        }`}>
                        {tipo === 'vencido'
                            ? `Venció el ${formatDate(lote.fecha_caducidad)}`
                            : `Vence en ${diasParaVencer} días (${formatDate(lote.fecha_caducidad)})`
                        }
                    </p>
                )}
            </div>
            <Button variant="secondary" size="sm" onClick={() => onVerDetalle(lote)}>
                <Eye size={16} />
                Ver
            </Button>
        </div>
    );
};

// Componentes de Badge
const EstadoStockBadge = ({ estado, porVencer }) => {
    const variants = {
        normal: 'success',
        bajo: 'warning',
        agotado: 'danger',
        exceso: 'info'
    };

    return (
        <div className="flex flex-col gap-1">
            <Badge variant={variants[estado]}>
                {estado === 'normal' ? 'Normal' :
                    estado === 'bajo' ? 'Stock Bajo' :
                        estado === 'agotado' ? 'Agotado' :
                            'Exceso'}
            </Badge>
            {porVencer && (
                <Badge variant="warning" size="sm">
                    ⚠️ Por Vencer
                </Badge>
            )}
        </div>
    );
};

const EstadoLoteBadge = ({ estado }) => {
    const config = {
        disponible: { variant: 'success', text: 'Disponible' },
        por_vencer: { variant: 'warning', text: 'Por Vencer' },
        vencido: { variant: 'danger', text: 'Vencido' },
        agotado: { variant: 'default', text: 'Agotado' }
    };

    const { variant, text } = config[estado] || config.disponible;

    return <Badge variant={variant}>{text}</Badge>;
};

export default Inventario;