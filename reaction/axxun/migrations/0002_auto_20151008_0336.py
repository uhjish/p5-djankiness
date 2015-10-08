# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('axxun', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='action',
            name='deadline',
            field=models.DateTimeField(),
        ),
    ]
