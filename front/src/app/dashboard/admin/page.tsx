'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';

function decodeJwt(token?: string | null): any | null {
  try {
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

type Publication = {
  id: string;
  type: 'band' | 'vacancy';
  name: string;
  description: string;
  urlImage?: string;
  genres?: string[];
  formationDate?: string;
  vacancyType?: string;
  isOpen?: boolean;
  owner?: { name?: string; email?: string };
};

type Review = {
  id: string;
  score: number;
  reviewDescription?: string;
  date: string;
  owner: { id?: string; name?: string; email?: string; userName?: string };
  receptor: { id?: string; name?: string; email?: string; userName?: string };
  urlImage?: string;
  ownerId?: string;
  receptorId?: string;
  isFlagged?: boolean;
  moderationReason?: string;
};

type ReviewUserOption = {
  id: string;
  name?: string;
  userName?: string;
  email?: string;
};

function ReviewsSection({ refreshToken, users }: { refreshToken: number; users: ReviewUserOption[] }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'owner' | 'receptor'>('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');

  useEffect(() => {
    loadReviews();
  }, [refreshToken]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await axios.get(`${apiBase}/admin/entities/reviews?page=1&limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const raw = res.data?.data || res.data || [];
      const mapped: Review[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
        id: String(r.id),
        score: Number(r.score || 0),
        reviewDescription: r.reviewDescription,
        date: r.date,
        owner: r.owner || {},
        receptor: r.receptor || {},
        urlImage: r.urlImage,
        ownerId: r.owner?.id,
        receptorId: r.receptor?.id,
        isFlagged: r.isFlagged,
        moderationReason: r.moderationReason,
      }));

      setReviews(mapped);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = reviews;

    if (selectedUserId) {
      result = result.filter((r) => {
        const isOwner = r.ownerId === selectedUserId;
        const isReceptor = r.receptorId === selectedUserId;

        if (userRoleFilter === 'owner') return isOwner;
        if (userRoleFilter === 'receptor') return isReceptor;
        return isOwner || isReceptor;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((r) =>
        r.owner?.name?.toLowerCase().includes(term) ||
        r.owner?.userName?.toLowerCase().includes(term) ||
        r.owner?.email?.toLowerCase().includes(term) ||
        r.receptor?.name?.toLowerCase().includes(term) ||
        r.receptor?.userName?.toLowerCase().includes(term) ||
        r.receptor?.email?.toLowerCase().includes(term) ||
        r.reviewDescription?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [reviews, searchTerm, selectedUserId, userRoleFilter]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const handleDelete = async (review: Review) => {
    const result = await Swal.fire({
      title: '¿Eliminar review?',
      text: 'Esta acción solo puede realizarla un administrador. La review se eliminará del historial.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        await Swal.fire('Error', 'No hay token de autenticación', 'error');
        return;
      }

      await axios.delete(`${apiBase}/admin/soft-delete/reviews/${review.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await Swal.fire('Eliminada', 'La review ha sido eliminada correctamente.', 'success');
      loadReviews();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'No se pudo eliminar la review';
      await Swal.fire('Error', msg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Historial de Reviews</h3>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 min-w-[200px]"
            >
              <option value="">Todos los usuarios</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.userName || u.email || u.id}
                </option>
              ))}
            </select>
            {selectedUserId && (
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value as any);
                  setPage(1);
                }}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              >
                <option value="all">Hechas y recibidas</option>
                <option value="owner">Solo hechas por él</option>
                <option value="receptor">Solo recibidas por él</option>
              </select>
            )}
          </div>
          <input
            type="text"
            placeholder="Buscar por usuario, email o descripción..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-tur1"></div>
        </div>
      ) : (
        <div className="rounded-xl bg-white/90 shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-900">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-3">De</th>
                  <th className="px-4 py-3">Para</th>
                  <th className="px-4 py-3">Puntuación</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-700">
                      No hay reviews
                    </td>
                  </tr>
                ) : (
                  pageRows.map((review) => (
                    <tr key={review.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">{review.owner?.name || review.owner?.userName || review.owner?.email || '—'}</td>
                      <td className="px-4 py-3">{review.receptor?.name || review.receptor?.userName || review.receptor?.email || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{review.score || 0}/5</span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate">{review.reviewDescription || '—'}</td>
                      <td className="px-4 py-3">{review.date ? new Date(review.date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(review)}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-xs text-gray-700">
              Mostrando {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} de {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <div className="text-sm text-gray-800">Página {page} de {totalPages}</div>
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Order = {
  id: string;
  amount: number;
  paymentMethod: string;
  transactionStatus: string;
  dateTime: string;
  description?: string;
};

function DonationsSection({ refreshToken }: { refreshToken: number }) {
  const [donations, setDonations] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');

  useEffect(() => {
    loadDonations();
  }, [refreshToken]);

  const loadDonations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await axios.get(`${apiBase}/payment`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allPayments = res.data?.data || res.data || [];
      const donationsData = allPayments.filter((p: any) => {
        const desc = (p.description || '').toLowerCase();
        const isDonation = desc.includes('donación') || desc.includes('donacion') || desc.includes('donation');
        return isDonation && p.transactionStatus === 'APPROVED';
      });

      setDonations(donationsData);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return donations;
    const term = searchTerm.toLowerCase();
    return donations.filter(d =>
      d.id.toLowerCase().includes(term) ||
      d.description?.toLowerCase().includes(term) ||
      d.paymentMethod.toLowerCase().includes(term)
    );
  }, [donations, searchTerm]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const totalAmount = useMemo(() => {
    return filtered.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Donaciones</h3>
          <p className="text-base font-semibold text-gray-800">
            Total recaudado: <span className="text-green-700 text-xl font-bold">${totalAmount.toFixed(2)}</span>
          </p>
        </div>
        <input
          type="text"
          placeholder="Buscar por ID, descripción..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="rounded-md border-2 border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-900 placeholder-gray-600 focus:border-tur1 focus:outline-none focus:ring-2 focus:ring-tur1/50"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-tur1"></div>
          <p className="mt-4 text-gray-800 font-medium">Cargando donaciones...</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-lg border-2 border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-4 text-gray-900 border-b-2 border-gray-300">ID</th>
                  <th className="px-4 py-4 text-gray-900 border-b-2 border-gray-300">Monto</th>
                  <th className="px-4 py-4 text-gray-900 border-b-2 border-gray-300">Método</th>
                  <th className="px-4 py-4 text-gray-900 border-b-2 border-gray-300">Fecha</th>
                  <th className="px-4 py-4 text-gray-900 border-b-2 border-gray-300">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-800 font-medium">
                      No hay donaciones
                    </td>
                  </tr>
                ) : (
                  pageRows.map((donation) => (
                    <tr key={donation.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-900">{donation.id}</td>
                      <td className="px-4 py-3 font-bold text-green-700 text-base">${Number(donation.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{donation.paymentMethod}</td>
                      <td className="px-4 py-3 text-gray-900">{donation.dateTime ? new Date(donation.dateTime).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 max-w-xs truncate text-gray-900">{donation.description || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-4 flex items-center justify-between border-t-2 border-gray-300 bg-gray-50">
            <div className="text-sm font-medium text-gray-800">
              Mostrando {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} de {filtered.length}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="rounded-md border-2 border-gray-400 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <div className="text-sm font-semibold text-gray-900">Página {page} de {totalPages}</div>
              <button
                className="rounded-md border-2 border-gray-400 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersSection({ refreshToken }: { refreshToken: number }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');

  useEffect(() => {
    loadOrders();
  }, [refreshToken]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await axios.get(`${apiBase}/payment`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const ordersData = res.data?.data || res.data || [];
      setOrders(ordersData);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter !== 'all') {
      result = result.filter(o => o.transactionStatus === statusFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(term) ||
        o.description?.toLowerCase().includes(term) ||
        o.paymentMethod.toLowerCase().includes(term)
      );
    }
    return result;
  }, [orders, searchTerm, statusFilter]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const totalAmount = useMemo(() => {
    return filtered
      .filter(o => o.transactionStatus === 'APPROVED')
      .reduce((sum, o) => sum + Number(o.amount || 0), 0);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Historial de Órdenes</h3>
          <p className="text-sm text-gray-700">Total aprobado: ${totalAmount.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
          >
            <option value="all">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="APPROVED">Aprobado</option>
            <option value="REJECTED">Rechazado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <input
            type="text"
            placeholder="Buscar por ID, descripción..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-tur1"></div>
        </div>
      ) : (
        <div className="rounded-xl bg-white/90 shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-900">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-700">
                      No hay órdenes
                    </td>
                  </tr>
                ) : (
                  pageRows.map((order) => (
                    <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                      <td className="px-4 py-3 font-semibold">${Number(order.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">{order.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.transactionStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          order.transactionStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.transactionStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.transactionStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">{order.dateTime ? new Date(order.dateTime).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{order.description || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-xs text-gray-700">
              Mostrando {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} de {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <div className="text-sm text-gray-800">Página {page} de {totalPages}</div>
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolsSection({ refreshToken }: { refreshToken: number }) {
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMassEmail = async () => {
    if (!emailSubject || !emailBody) {
      Swal.fire('Error', 'Por favor completa el asunto y el cuerpo del email', 'error');
      return;
    }

    const result = await Swal.fire({
      title: '¿Enviar email masivo?',
      text: 'Esto enviará el email a todos los usuarios registrados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      setSending(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          Swal.fire('Error', 'No hay token de autenticación', 'error');
          setSending(false);
          return;
        }

        const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
        if (!apiBase) {
          Swal.fire('Error', 'URL del backend no configurada', 'error');
          setSending(false);
          return;
        }

        const response = await axios.post(
          `${apiBase}/admin/send-mass-email`,
          {
            subject: emailSubject,
            body: emailBody,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = response.data?.data || response.data;
        const sent = data?.sent || 0;
        const total = data?.total || 0;
        const failed = data?.failed || 0;

        if (failed > 0) {
          Swal.fire({
            title: 'Envío parcial',
            html: `Se enviaron ${sent} de ${total} emails.<br>${failed} emails fallaron.`,
            icon: 'warning',
          });
        } else {
          Swal.fire({
            title: '¡Éxito!',
            text: `Se enviaron ${sent} emails correctamente`,
            icon: 'success',
          });
          setEmailSubject('');
          setEmailBody('');
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'No se pudo enviar el email';
        Swal.fire('Error', errorMsg, 'error');
      } finally {
        setSending(false);
      }
    }
  };

  const handleRecalculateMetrics = async () => {
    const result = await Swal.fire({
      title: '¿Recalcular métricas?',
      text: 'Esto recalculará todas las métricas del sistema',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, recalcular',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await Swal.fire('Info', 'Funcionalidad de recálculo requiere implementación en el backend', 'info');
      } catch (err) {
        Swal.fire('Error', 'No se pudieron recalcular las métricas', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white/90 shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Envío Masivo de Emails</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Asunto</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Asunto del email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Cuerpo del mensaje</label>
            <textarea
              rows={6}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Contenido del email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500"
            />
          </div>
          <button
            onClick={handleSendMassEmail}
            disabled={sending || !emailSubject || !emailBody}
            className="px-4 py-2 bg-tur1 text-azul rounded-md hover:bg-tur2 transition disabled:opacity-50"
          >
            {sending ? 'Enviando...' : 'Enviar a todos los usuarios'}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white/90 shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Herramientas de Base de Datos</h3>
        <div className="space-y-3">
          <button
            onClick={handleRecalculateMetrics}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Recalcular Métricas
          </button>
          <p className="text-sm text-gray-700">
            Estas herramientas requieren implementación en el backend para funcionar completamente.
          </p>
        </div>
      </div>
    </div>
  );
}

function PublicationsSection({ refreshToken }: { refreshToken: number }) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [pubType, setPubType] = useState<'band' | 'vacancy'>('band');
  const [showModal, setShowModal] = useState(false);
  const [editingPub, setEditingPub] = useState<Publication | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    urlImage: '',
    genres: [] as string[],
    formationDate: '',
    vacancyType: '',
  });

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');

  useEffect(() => {
    loadPublications();
    loadGenres();
  }, [pubType, refreshToken]);

  const loadGenres = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${apiBase}/genre?page=1&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const genresData = res.data?.data || res.data || [];
      setGenres(genresData.map((g: any) => g.name || g));
    } catch (err) {
      // ignore
    }
  };

  const loadPublications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const entityType = pubType === 'band' ? 'bands' : 'vacancies';
      const res = await axios.get(`${apiBase}/admin/entities/${entityType}?page=1&limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data?.data || res.data || [];
      const mapped = data.map((item: any) => ({
        id: item.id,
        type: pubType,
        name: item.bandName || item.name,
        description: item.bandDescription || item.vacancyDescription,
        urlImage: item.urlImage,
        genres: item.genres?.map((g: any) => g.name || g) || [],
        formationDate: item.formationDate,
        vacancyType: item.vacancyType,
        isOpen: item.isOpen,
        owner: item.leader || item.owner,
      }));

      setPublications(mapped);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPub(null);
    setFormData({
      name: '',
      description: '',
      urlImage: '',
      genres: [],
      formationDate: '',
      vacancyType: '',
    });
    setShowModal(true);
  };

  const handleEdit = (pub: Publication) => {
    setEditingPub(pub);
    setFormData({
      name: pub.name,
      description: pub.description,
      urlImage: pub.urlImage || '',
      genres: pub.genres || [],
      formationDate: pub.formationDate ? (pub.formationDate.includes('T') ? pub.formationDate.split('T')[0] : pub.formationDate) : '',
      vacancyType: pub.vacancyType || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (pub: Publication) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar esta ${pub.type === 'band' ? 'banda' : 'vacante'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const entityType = pub.type === 'vacancy' ? 'vacancies' : 'bands';
        await axios.delete(`${apiBase}/admin/soft-delete/${entityType}/${pub.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire('¡Eliminado!', `La ${pub.type === 'band' ? 'banda' : 'vacante'} ha sido eliminada.`, 'success');
        loadPublications();
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.message || 'No se pudo eliminar', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      if (editingPub) {
        const endpoint = editingPub.type === 'band' ? 'band' : 'vacancy';
        const updateData: any = {
          ...(editingPub.type === 'band' 
            ? { bandName: formData.name, bandDescription: formData.description, formationDate: formData.formationDate }
            : { name: formData.name, vacancyDescription: formData.description, vacancyType: formData.vacancyType }
          ),
          urlImage: formData.urlImage,
          genres: formData.genres,
        };

        await axios.patch(`${apiBase}/${endpoint}/${editingPub.id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire('¡Actualizado!', 'La publicación ha sido actualizada.', 'success');
      } else {
        const endpoint = pubType === 'band' ? 'band' : 'vacancy';
        const createData: any = pubType === 'band'
          ? {
              bandName: formData.name,
              bandDescription: formData.description,
              formationDate: formData.formationDate,
              urlImage: formData.urlImage,
              genres: formData.genres,
            }
          : {
              name: formData.name,
              vacancyDescription: formData.description,
              urlImage: formData.urlImage,
              genres: formData.genres,
              vacancyType: formData.vacancyType,
            };

        await axios.post(`${apiBase}/${endpoint}`, createData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire('¡Creado!', 'La publicación ha sido creada.', 'success');
      }

      setShowModal(false);
      loadPublications();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'No se pudo guardar', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setPubType('band')}
            className={`px-4 py-2 font-medium ${pubType === 'band' ? 'border-b-2 border-tur1 text-tur1' : 'text-gray-700'}`}
          >
            Bandas
          </button>
          <button
            onClick={() => setPubType('vacancy')}
            className={`px-4 py-2 font-medium ${pubType === 'vacancy' ? 'border-b-2 border-tur1 text-tur1' : 'text-gray-700'}`}
          >
            Vacantes
          </button>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-tur1 text-azul rounded-md hover:bg-tur2 transition"
        >
          + Nueva {pubType === 'band' ? 'Banda' : 'Vacante'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-tur1"></div>
        </div>
      ) : (
        <div className="rounded-xl bg-white/90 shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-900">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Géneros</th>
                  <th className="px-4 py-3">Imagen</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {publications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-700">
                      No hay {pubType === 'band' ? 'bandas' : 'vacantes'}
                    </td>
                  </tr>
                ) : (
                  publications.map((pub) => (
                    <tr key={pub.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{pub.name}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{pub.description}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {pub.genres?.slice(0, 2).map((g, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                              {g}
                            </span>
                          ))}
                          {pub.genres && pub.genres.length > 2 && (
                            <span className="text-xs text-gray-700">+{pub.genres.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {pub.urlImage && (
                          <img src={pub.urlImage} alt={pub.name} className="h-10 w-10 rounded object-cover" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(pub)}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(pub)}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                {editingPub ? 'Editar' : 'Crear'} {pubType === 'band' ? 'Banda' : 'Vacante'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    {pubType === 'band' ? 'Nombre de la banda' : 'Título'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Descripción</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">URL de Imagen</label>
                  <input
                    type="url"
                    value={formData.urlImage}
                    onChange={(e) => setFormData({ ...formData, urlImage: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                {pubType === 'band' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Fecha de Formación</label>
                    <input
                      type="date"
                      required
                      value={formData.formationDate}
                      onChange={(e) => setFormData({ ...formData, formationDate: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    />
                  </div>
                )}
                {pubType === 'vacancy' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Tipo de Vacante</label>
                    <input
                      type="text"
                      value={formData.vacancyType}
                      onChange={(e) => setFormData({ ...formData, vacancyType: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500"
                      placeholder="Ej: Evento, Proyecto, etc."
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Géneros</label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <label key={genre} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.genres.includes(genre)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, genres: [...formData.genres, genre] });
                            } else {
                              setFormData({ ...formData, genres: formData.genres.filter(g => g !== genre) });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-900">{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-tur1 text-azul rounded-md hover:bg-tur2"
                  >
                    {editingPub ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminMetricsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [userCount, setUserCount] = useState<number>(0);
  const [bandCount, setBandCount] = useState<number>(0);
  const [vacancyCount, setVacancyCount] = useState<number>(0);

  type UserRow = {
    id: string;
    name?: string;
    userName?: string;
    email?: string;
    country?: string;
    roles?: { name: string }[];
    isBanned?: boolean;
  };
  const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [refreshToken, setRefreshToken] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'publications' | 'reviews' | 'orders' | 'donations' | 'tools'>('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setAuthorized(false);
        setError('No autorizado - Inicia sesión');
        setLoading(false);
        router.push('/login');
        return;
      }

      const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
      if (!base) {
        setAuthorized(false);
        setError('URL del backend no configurada');
        setLoading(false);
        return;
      }

      // Primero intentar verificar con el token del JWT
      const payload = decodeJwt(token);
      let roles: string[] = Array.isArray(payload?.roles) ? payload.roles : [];
      let isAdmin = roles.includes('Admin') || roles.includes('SuperAdmin');
      
      // Si no es admin según el JWT, verificar en localStorage
      if (!isAdmin) {
        try {
          const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
          if (userStr) {
            const user = JSON.parse(userStr);
            const userRoles = user?.roles?.map((r: any) => r.name) || [];
            roles = userRoles;
            isAdmin = userRoles.includes('Admin') || userRoles.includes('SuperAdmin');
          }
        } catch (e) {
          // ignore
        }
      }

      // Si aún no es admin, verificar con el backend usando /auth/me
      if (!isAdmin) {
        try {
          const response = await axios.get(`${base}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // El endpoint /auth/me devuelve { data: { user: {...} } }
          const userData = response.data?.data?.user || response.data?.user || response.data?.data || response.data;
          const backendRoles = userData?.roles?.map((r: any) => r.name) || [];
          roles = backendRoles;
          isAdmin = backendRoles.includes('Admin') || backendRoles.includes('SuperAdmin');
          
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (err: any) {
          // Si es un error de red, intentar usar datos de localStorage
          if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
            // Intentar cargar desde localStorage como fallback
            try {
              const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
              if (userStr) {
                const user = JSON.parse(userStr);
                const userRoles = user?.roles?.map((r: any) => r.name) || [];
                const isAdminLocal = userRoles.includes('Admin') || userRoles.includes('SuperAdmin');
                
                if (isAdminLocal) {
                  // Usar datos locales si el usuario es admin
                  setCurrentUserRoles(userRoles);
                  setAuthorized(true);
                  // Continuar con la carga de datos (puede fallar pero al menos permite ver la UI)
                } else {
                  setAuthorized(false);
                  setError('Error de conexión: No se pudo verificar tu sesión. Verifica que el backend esté corriendo.');
                  setLoading(false);
                  return;
                }
              } else {
                setAuthorized(false);
                setError('Error de conexión: No se pudo verificar tu sesión. Verifica que el backend esté corriendo.');
                setLoading(false);
                return;
              }
            } catch (e) {
              setAuthorized(false);
              setError('Error de conexión: No se pudo verificar tu sesión. Verifica que el backend esté corriendo.');
              setLoading(false);
              return;
            }
          }
          
          // Si es 401, el token es inválido - redirigir al login
          if (err.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            setAuthorized(false);
            setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
            setLoading(false);
            router.push('/login');
            return;
          }
          
          // Otro error - no es admin
          setAuthorized(false);
          setError('No autorizado - Tu cuenta no tiene permisos de administrador.');
          setLoading(false);
          return;
        }
      }

      if (!isAdmin) {
        setAuthorized(false);
        setError('No autorizado - Tu cuenta no tiene permisos de administrador.');
        setLoading(false);
        return;
      }

      setCurrentUserRoles(roles);
      setAuthorized(true);

      const load = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (!token) {
          setError('No hay token de autenticación');
          setLoading(false);
          return;
        }
        const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
        if (!base) {
          setError('URL del backend no configurada');
          setLoading(false);
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const [u, b, v] = await Promise.all([
          axios.get(`${base}/admin/entities/users?page=1&limit=10000`, { headers }),
          axios.get(`${base}/admin/entities/bands?page=1&limit=10000`, { headers }),
          axios.get(`${base}/admin/entities/vacancies?page=1&limit=10000`, { headers }),
        ]);
        const uData = Array.isArray(u.data?.data) ? u.data.data : Array.isArray(u.data) ? u.data : [];
        const bData = Array.isArray(b.data?.data) ? b.data.data : Array.isArray(b.data) ? b.data : [];
        const vData = Array.isArray(v.data?.data) ? v.data.data : Array.isArray(v.data) ? v.data : [];

        setUserCount(uData.length || 0);
        setBandCount(bData.length || 0);
        setVacancyCount(vData.length || 0);

        setUsers(
          (uData as any[]).map((x) => ({
            id: String(x.id ?? x._id ?? crypto.randomUUID()),
            name: x.name,
            userName: x.userName,
            email: x.email,
            country: x.country,
            roles: Array.isArray(x.roles) ? x.roles : [],
            isBanned: x.isBanned || false,
          })),
        );
      } catch (e: any) {
        const errorMsg = e.response?.data?.message || e.message || 'No se pudieron cargar los datos';
        setError(`Error: ${errorMsg}. Verifica que la URL del backend esté configurada correctamente.`);
      } finally {
        setLoading(false);
      }
    };

    await load();
    };

    checkAuth();
  }, [refreshToken]);

  const filtered = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.userName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.country || '').toLowerCase().includes(q) ||
        (u.roles || []).some((r) => (r?.name || '').toLowerCase().includes(q)),
    );
  }, [users, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleForceRefresh = async () => {
    setLoading(true);
    setError(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setError('No hay token de autenticación');
      setLoading(false);
      router.push('/login');
      return;
    }

    const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
    if (!base) {
      setError('URL del backend no configurada');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${base}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // El endpoint /auth/me devuelve { data: { user: {...} } }
      const userData = response.data?.data?.user || response.data?.user || response.data?.data || response.data;
      const backendRoles = userData?.roles?.map((r: any) => r.name) || [];
      const isAdmin = backendRoles.includes('Admin') || backendRoles.includes('SuperAdmin');
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      if (isAdmin) {
        setCurrentUserRoles(backendRoles);
        setAuthorized(true);
        // Recargar los datos del dashboard
        setRefreshToken((x) => x + 1);
      } else {
        setError('Tu cuenta aún no tiene permisos de administrador. Verifica en la base de datos que tu usuario tenga el rol "Admin" o "SuperAdmin".');
      }
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Error de conexión: No se pudo conectar al backend. Verifica que el servidor esté corriendo en ' + base);
      } else if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        router.push('/login');
      } else {
        setError(`Error al recargar datos: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!authorized) {
    return (
      <div className="pt-20 px-6 md:px-12 lg:px-24">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm text-center">
          <p className="text-red-600 mb-4">{error || 'No autorizado'}</p>
          <button
            onClick={handleForceRefresh}
            disabled={loading}
            className="px-4 py-2 bg-tur1 text-azul rounded-md hover:bg-tur2 transition disabled:opacity-50"
          >
            {loading ? 'Recargando...' : 'Recargar datos del usuario'}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Abre la consola del navegador (F12) para ver logs de debug
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-20 px-6 md:px-12 lg:px-24">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-tur1" /> Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 md:px-8 lg:px-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel de Administración</h1>

      {/* Tabs */}
      <div className="border-b-2 border-gray-300 mb-6 bg-white/10 backdrop-blur-sm rounded-t-lg px-2">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'users', label: 'Usuarios', icon: '👥' },
            { id: 'publications', label: 'Publicaciones', icon: '📝' },
            { id: 'reviews', label: 'Reviews', icon: '⭐' },
            { id: 'orders', label: 'Órdenes', icon: '💳' },
            { id: 'donations', label: 'Donaciones', icon: '💰' },
            { id: 'tools', label: 'Herramientas', icon: '🔧' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-4 font-bold text-base transition-all ${
                activeTab === tab.id
                  ? 'border-tur1 text-white font-extrabold bg-tur1/20 shadow-lg'
                  : 'border-transparent text-gray-100 hover:text-white hover:border-gray-300 hover:bg-white/10'
              }`}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-white/90 shadow-sm border border-gray-200">
          <div className="p-5">
            <div className="text-xs uppercase tracking-wider text-gray-700 font-medium">Usuarios</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{userCount}</div>
            <div className="mt-1 text-xs text-gray-700">Total registrados</div>
          </div>
        </div>
        <div className="rounded-xl bg-white/90 shadow-sm border border-gray-200">
          <div className="p-5">
            <div className="text-xs uppercase tracking-wider text-gray-700 font-medium">Bandas</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{bandCount}</div>
            <div className="mt-1 text-xs text-gray-700">Total creadas</div>
          </div>
        </div>
        <div className="rounded-xl bg-white/90 shadow-sm border border-gray-200">
          <div className="p-5">
            <div className="text-xs uppercase tracking-wider text-gray-700 font-medium">Vacantes</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{vacancyCount}</div>
            <div className="mt-1 text-xs text-gray-700">Publicadas</div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="rounded-xl bg-white/90 shadow-sm border border-gray-200">
        <div className="p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Usuarios</h3>
            <p className="text-xs text-gray-700">Gestión y vista general</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, email, rol..."
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-tur1/50"
            />
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value) || 10);
                setPage(1);
              }}
              className="rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-900">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-700 font-medium">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">País</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No hay usuarios que coincidan con la búsqueda
                  </td>
                </tr>
              ) : (
                pageRows.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{u.name || '—'}</td>
                    <td className="px-4 py-3">{u.userName || '—'}</td>
                    <td className="px-4 py-3">{u.email || '—'}</td>
                    <td className="px-4 py-3">{u.country || '—'}</td>
                    <td className="px-4 py-3">
                      {(u.roles || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.roles!.map((r, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-tur1/20 px-2 py-0.5 text-xs font-medium text-azul border border-tur1/40"
                            >
                              {String(r?.name)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 border border-red-300">
                          Baneado
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border border-green-300">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {currentUserRoles.includes('SuperAdmin') && !u.roles?.some(r => r.name === 'Admin' || r.name === 'SuperAdmin') && (
                          <button
                            className="rounded-md border border-green-300 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
                            onClick={async () => {
                              if (!confirm('¿Hacer Admin a este usuario?')) return;
                              try {
                                const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
                                if (!token) {
                                  alert('No hay token de autenticación');
                                  return;
                                }
                                const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
                                await axios.patch(`${base}/admin/${u.id}`, {}, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                setRefreshToken((x) => x + 1);
                              } catch (e: any) {
                                const errorMsg = e.response?.data?.message || e.message || 'No se pudo asignar Admin';
                                alert(`Error: ${errorMsg}`);
                              }
                            }}
                          >
                            Hacer Admin
                          </button>
                        )}
                        {u.isBanned ? (
                          <button
                            className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            onClick={async () => {
                              if (!confirm('¿Desbanear a este usuario?')) return;
                              try {
                                const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
                                if (!token) {
                                  alert('No hay token de autenticación');
                                  return;
                                }
                                const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
                                await axios.patch(`${base}/admin/unban/${u.id}`, {}, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                setRefreshToken((x) => x + 1);
                              } catch (e: any) {
                                const errorMsg = e.response?.data?.message || e.message || 'No se pudo desbanear al usuario';
                                alert(`Error: ${errorMsg}`);
                              }
                            }}
                          >
                            Desbanear
                          </button>
                        ) : (
                          <button
                            className="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                            onClick={async () => {
                              if (!confirm('¿Banear a este usuario? El usuario no podrá iniciar sesión hasta que sea desbaneado.')) return;
                              try {
                                const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
                                if (!token) {
                                  alert('No hay token de autenticación');
                                  return;
                                }
                                const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
                                await axios.patch(`${base}/admin/ban/${u.id}`, { reason: 'Baneado por administrador' }, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                setRefreshToken((x) => x + 1);
                              } catch (e: any) {
                                const errorMsg = e.response?.data?.message || e.message || 'No se pudo banear al usuario';
                                alert(`Error: ${errorMsg}`);
                              }
                            }}
                          >
                            Banear
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Mostrando {(page - 1) * rowsPerPage + 1}–
            {Math.min(page * rowsPerPage, filtered.length)} de {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <div className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </div>
            <button
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Publications Tab */}
      {activeTab === 'publications' && <PublicationsSection refreshToken={refreshToken} />}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && <ReviewsSection refreshToken={refreshToken} users={users} />}

      {/* Orders Tab */}
      {activeTab === 'orders' && <OrdersSection refreshToken={refreshToken} />}

      {/* Donations Tab */}
      {activeTab === 'donations' && <DonationsSection refreshToken={refreshToken} />}

      {/* Tools Tab */}
      {activeTab === 'tools' && <ToolsSection refreshToken={refreshToken} />}
    </div>
  );
}


