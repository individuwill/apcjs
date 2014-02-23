move .mib command into an snmp path ex: ~/.snmp/mibs
you can find which directories are used with 'net-snmp-config --default-mibdirs' command

run walk command like 'snmpwalk -m +PowerNet-MIB -v 1 -c public apc 1.3.6.1.4'

