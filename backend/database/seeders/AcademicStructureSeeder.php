<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\GraduationYear;
use App\Models\Programme;
use App\Models\School;
use Illuminate\Database\Seeder;

/**
 * Seeds a minimal starter academic structure so the app is usable
 * immediately after install. Admins can add/edit/remove all of this
 * from the Admin Panel — nothing here is hardcoded into the app logic.
 */
class AcademicStructureSeeder extends Seeder
{
    public function run(): void
    {
        $school = School::updateOrCreate(
            ['code' => 'SICT'],
            ['name' => 'School of Information & Communication Technology']
        );

        $dept = Department::updateOrCreate(
            ['school_id' => $school->id, 'code' => 'CSC'],
            ['name' => 'Computer Science']
        );

        foreach (['National Diploma (ND)', 'Higher National Diploma (HND)'] as $name) {
            Programme::updateOrCreate(
                ['department_id' => $dept->id, 'name' => $name],
                ['duration_years' => 2]
            );
        }

        foreach (range(2018, 2026) as $year) {
            GraduationYear::updateOrCreate(['year' => $year], ['label' => (string) $year]);
        }
    }
}
