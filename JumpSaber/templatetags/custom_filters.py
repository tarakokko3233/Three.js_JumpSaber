from django import template

register = template.Library()

@register.filter(name='multiply')
def multiply(value, arg):
    return value * arg

@register.filter(name='days_difference')
def days_difference(value, arg):
    return (value - arg).days
