<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Exports\AlumniExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Alumni export report: format=csv|pdf|xlsx. Requires
     * barryvdh/laravel-dompdf and maatwebsite/excel (both pinned in
     * composer.json) — run `composer install` before hitting pdf/xlsx.
     */
    public function alumni(Request $request)
    {
        $format = $request->query('format', 'csv');

        $profiles = AlumniProfile::with(['user', 'programme.department.school', 'graduationYear'])
            ->whereHas('user', fn ($q) => $q->where('status', 'active'))
            ->get();

        return match ($format) {
            'pdf' => $this->pdf($profiles),
            'xlsx' => Excel::download(new AlumniExport($profiles), 'alumni-report.xlsx'),
            default => $this->csv($profiles),
        };
    }

    private function csv($profiles)
    {
        $rows = $profiles->map(fn (AlumniProfile $p) => [
            $p->user->name,
            $p->matric_number,
            $p->programme?->department?->school?->name,
            $p->programme?->department?->name,
            $p->programme?->name,
            $p->graduationYear?->year,
            $p->employment_status,
            $p->current_occupation,
            $p->employer,
        ]);

        $callback = function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Name', 'Matric No', 'School', 'Department', 'Programme', 'Graduation Year', 'Employment Status', 'Occupation', 'Employer']);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        };

        return Response::stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="alumni-report.csv"',
        ]);
    }

    private function pdf($profiles)
    {
        $pdf = Pdf::loadView('reports.alumni', [
            'profiles' => $profiles,
            'generatedAt' => now()->format('d M Y, H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('alumni-report.pdf');
    }
}
