<?php

namespace App\Exports;

use App\Models\AlumniProfile;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AlumniExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function __construct(private Collection $profiles)
    {
    }

    public function collection(): Collection
    {
        return $this->profiles;
    }

    public function headings(): array
    {
        return ['Name', 'Matric No', 'School', 'Department', 'Programme', 'Graduation Year', 'Employment Status', 'Occupation', 'Employer'];
    }

    public function map($profile): array
    {
        /** @var AlumniProfile $profile */
        return [
            $profile->user->name,
            $profile->matric_number,
            $profile->programme?->department?->school?->name,
            $profile->programme?->department?->name,
            $profile->programme?->name,
            $profile->graduationYear?->year,
            $profile->employment_status,
            $profile->current_occupation,
            $profile->employer,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}
