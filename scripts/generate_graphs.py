import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Example data
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

# Custom styling for stock trading plots
sns.set_theme(style="darkgrid")  # Additional seaborn styling
plt.rcParams['axes.facecolor'] = '#f0f0f0'  # Light gray background
plt.rcParams['grid.color'] = '#d0d0d0'  # Light gray grid lines
plt.rcParams['lines.linewidth'] = 2  # Thicker lines
plt.rcParams['axes.titlesize'] = 16  # Larger title
plt.rcParams['axes.labelsize'] = 14  # Larger axis labels
plt.rcParams['xtick.labelsize'] = 12  # Larger x-tick labels
plt.rcParams['ytick.labelsize'] = 12  # Larger y-tick labels

# Plotting Company A and B
plt.figure(figsize=(10, 5))
plt.plot(x, y1, label='Company A', color='#1f77b4')  # Blue line
plt.plot(x, y2, label='Company B', color='#ff7f0e')  # Orange line
plt.title('Stock Performance - Companies A & B', pad=20)
plt.xlabel('Time (Days)', labelpad=10)
plt.ylabel('Price (USD)', labelpad=10)
plt.legend(loc='upper left', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.7)
plt.tight_layout()
plt.savefig('website/images/graph1.png', dpi=300, bbox_inches='tight')

# Plotting Company C and D
plt.figure(figsize=(10, 5))
plt.plot(x, y1 * 2, label='Company C', color='#2ca02c')  # Green line
plt.plot(x, y2 * 2, label='Company D', color='#d62728')  # Red line
plt.title('Stock Performance - Companies C & D', pad=20)
plt.xlabel('Time (Days)', labelpad=10)
plt.ylabel('Price (USD)', labelpad=10)
plt.legend(loc='upper left', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.7)
plt.tight_layout()
plt.savefig('website/images/graph2.png', dpi=300, bbox_inches='tight') 