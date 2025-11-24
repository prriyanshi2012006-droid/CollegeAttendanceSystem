# attendance_app/management/commands/update_course_totals.py
from django.core.management.base import BaseCommand
from django.db.models import Count
from attendance_app.models import Course, AttendanceRecord

class Command(BaseCommand):
    help = 'Updates the total_classes count on the Course model based on unique attendance dates.'

    def handle(self, *args, **options):
        self.stdout.write('Starting course total update...')

        # Group all attendance records by course and date, then count the unique dates
        course_totals = AttendanceRecord.objects.values('course').annotate(
            unique_dates=Count('date', distinct=True)
        )

        # Iterate through the results and update the Course model
        for item in course_totals:
            course_id = item['course']
            unique_dates_count = item['unique_dates']

            Course.objects.filter(id=course_id).update(total_classes=unique_dates_count)

        self.stdout.write(self.style.SUCCESS('Successfully updated total classes for all courses.'))

# How to run: python manage.py update_course_totals