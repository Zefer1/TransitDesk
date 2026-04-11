/**
 * ServicePrintSheet.tsx
 *
 * A print-only layout that is always in the DOM but hidden from the screen.
 * When the user clicks "Print / Export PDF", the browser shows only this sheet.
 *
 * Company info is read from localStorage (saved by SettingsPage).
 * Service data is passed in as a prop from ServiceDetailPage.
 */
import './ServicePrintSheet.css';
import type { Service } from '../../../types/service.types';
import { formatDateTime } from '../utils/serviceFormatters';

/** Same key used by SettingsPage to save company info. */
const COMPANY_STORAGE_KEY = 'transitdesk:company:v1';

// Read company info from localStorage once at render time.
// Returns empty strings as fallback if nothing has been saved in Settings yet,
// or if the stored data is corrupt and cannot be parsed.
function getCompanyInfo() {
  const saved = localStorage.getItem(COMPANY_STORAGE_KEY);
  if (!saved) {
    return { companyName: '', rnaat: '', tp: '', designation: '', logoUrl: '' };
  }
  try {
    const data = JSON.parse(saved);
    return {
      companyName: data.companyName ?? '',
      rnaat: data.rnaat ?? '',
      tp: data.tp ?? '',
      designation: data.designation ?? '',
      logoUrl: data.logoUrl ?? '',
    };
  } catch {
    // JSON.parse throws if the stored string is malformed.
    // Return empty strings so the print sheet still renders without crashing.
    return { companyName: '', rnaat: '', tp: '', designation: '', logoUrl: '' };
  }
}

interface ServicePrintSheetProps {
  service: Service;
}

export function ServicePrintSheet({ service }: ServicePrintSheetProps) {
  const company = getCompanyInfo();

  // Build the route string from the stops array, e.g. "Funchal -> Santana -> Porto Moniz"
  const routeSummary = service.stops.length > 0 ? service.stops.join(' -> ') : 'No stops listed';

  // Inline styles are used throughout this component instead of CSS classes.
  // Reason: some browsers and PDF export engines deprioritise or block external
  // stylesheets during printing, but inline styles are always applied. This
  // guarantees the sheet looks the same regardless of browser or print settings.
  return (
    <div className="print-only" style={{ fontFamily: 'Arial, sans-serif', color: '#111', padding: '32px' }}>

      {/* ── Company header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '2px solid #111', paddingBottom: '16px' }}>
        {company.logoUrl && (
          <img
            src={company.logoUrl}
            alt="Company logo"
            style={{ height: '300px', width: 'auto', objectFit: 'contain' }}
          />
        )}
        <div>
          {company.companyName && <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{company.companyName}</p>}
          {company.designation && <p style={{ fontSize: '12px', margin: '2px 0 0' }}>{company.designation}</p>}
          {company.rnaat && <p style={{ fontSize: '12px', margin: '2px 0 0' }}>{company.rnaat}</p>}
          {company.tp && <p style={{ fontSize: '12px', margin: '2px 0 0' }}>{company.tp}</p>}
        </div>
      </div>

      {/* ── Sheet title ── */}
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
        Service Sheet — #{service.id}
      </h1>
      <p style={{ fontSize: '13px', color: '#555', marginBottom: '24px' }}>
        {service.type} · {formatDateTime(service.scheduledAt)}
      </p>

      {/* ── Service details ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '160px', verticalAlign: 'top' }}>Description</td>
            <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{service.description}</td>
          </tr>
          {service.agencyName && (
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '160px', verticalAlign: 'top' }}>Agency</td>
              <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{service.agencyName}</td>
            </tr>
          )}
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '160px', verticalAlign: 'top' }}>Route</td>
            <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{routeSummary}</td>
          </tr>
          {service.passengerQuantity != null && (
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '160px', verticalAlign: 'top' }}>Passengers</td>
              <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{service.passengerQuantity}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Assignments ── */}
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
        Assignments
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '160px', verticalAlign: 'top' }}>Vehicle</td>
            <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>
              {service.vehicle.licensePlate} ({service.vehicle.brand} {service.vehicle.model}) — Capacity: {service.vehicle.passengerCapacity}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '160px', verticalAlign: 'top' }}>Driver</td>
            <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{service.driver.name}</td>
          </tr>
          {service.guide && (
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '160px', verticalAlign: 'top' }}>Guide</td>
              <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{service.guide.name}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Notes (only shown when present) ── */}
      {service.notes && (
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
            Notes
          </h2>
          <p style={{ fontSize: '13px', whiteSpace: 'pre-line' }}>{service.notes}</p>
        </div>
      )}
    </div>
  );
}
