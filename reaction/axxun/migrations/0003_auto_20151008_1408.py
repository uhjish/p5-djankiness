# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('axxun', '0002_auto_20151008_0336'),
    ]

    operations = [
        migrations.AddField(
            model_name='action',
            name='title',
            field=models.CharField(default='untitled', max_length=80),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='action',
            name='description',
            field=models.CharField(max_length=160),
        ),
    ]
