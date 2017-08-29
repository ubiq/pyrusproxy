# Delete all existing rules
iptables -F

# Set default chain policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP

# Allow incoming SSH
iptables -A INPUT -i ens3 -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o ens3 -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT

# Allow incoming HTTP
iptables -A INPUT -i ens3 -p tcp --dport 80 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o ens3 -p tcp --sport 80 -m state --state ESTABLISHED -j ACCEPT

# Allow outgoing HTTP
iptables -A OUTPUT -o ens3 -p tcp --dport 80 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A INPUT -i ens3 -p tcp --sport 80 -m state --state ESTABLISHED -j ACCEPT

# Allow incoming HTTPS
iptables -A INPUT -i ens3 -p tcp --dport 443 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o ens3 -p tcp --sport 443 -m state --state ESTABLISHED -j ACCEPT

# Allow outgoing HTTPS
iptables -A OUTPUT -o ens3 -p tcp --dport 443 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A INPUT -i ens3 -p tcp --sport 443 -m state --state ESTABLISHED -j ACCEPT

# Allow incoming Gubiq
iptables -A INPUT -i ens3 -p tcp --dport 30388 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o ens3 -p tcp --sport 30388 -m state --state ESTABLISHED -j ACCEPT
iptables -A INPUT -i ens3 -p udp --dport 30388 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o ens3 -p udp --sport 30388 -m state --state ESTABLISHED -j ACCEPT

# Allow outgoing Gubiq
iptables -A OUTPUT -o ens3 -p tcp --dport 30388 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A INPUT -i ens3 -p tcp --sport 30388 -m state --state ESTABLISHED -j ACCEPT
iptables -A OUTPUT -o ens3 -p udp --dport 30388 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A INPUT -i ens3 -p udp --sport 30388 -m state --state ESTABLISHED -j ACCEPT

# Ping from inside to outside
iptables -A OUTPUT -p icmp --icmp-type echo-request -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-reply -j ACCEPT

# Allow loopback access
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow outbound DNS
iptables -A OUTPUT -p udp -o ens3 --dport 53 -j ACCEPT -m state --state NEW,ESTABLISHED
iptables -A INPUT  -p udp -i ens3 --sport 53 -j ACCEPT -m state --state ESTABLISHED
iptables -A OUTPUT -p tcp -o ens3 --dport 53 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A INPUT  -p tcp -i ens3 --sport 53 -m state --state ESTABLISHED     -j ACCEPT
