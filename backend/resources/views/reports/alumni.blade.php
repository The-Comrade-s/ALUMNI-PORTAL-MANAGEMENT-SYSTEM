<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #101B33; }
        h1 { color: #0B2D6B; font-size: 18px; margin-bottom: 2px; }
        p.meta { color: #5B6B85; margin-top: 0; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0B2D6B; color: #fff; text-align: left; padding: 6px 8px; font-size: 10px; }
        td { border-bottom: 1px solid #E4E8F0; padding: 6px 8px; }
        tr:nth-child(even) td { background: #F7F8FB; }
    </style>
</head>
<body>
    <h1>Gateway ICT Polytechnic Saapade — Alumni Report</h1>
    <p class="meta">Generated {{ $generatedAt }} &middot; {{ $profiles->count() }} active alumni</p>

    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Matric No</th>
                <th>School</th>
                <th>Department</th>
                <th>Programme</th>
                <th>Grad. Year</th>
                <th>Employment</th>
                <th>Occupation</th>
                <th>Employer</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($profiles as $p)
                <tr>
                    <td>{{ $p->user->name }}</td>
                    <td>{{ $p->matric_number }}</td>
                    <td>{{ $p->programme?->department?->school?->name }}</td>
                    <td>{{ $p->programme?->department?->name }}</td>
                    <td>{{ $p->programme?->name }}</td>
                    <td>{{ $p->graduationYear?->year }}</td>
                    <td>{{ ucfirst(str_replace('_', ' ', $p->employment_status)) }}</td>
                    <td>{{ $p->current_occupation }}</td>
                    <td>{{ $p->employer }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
